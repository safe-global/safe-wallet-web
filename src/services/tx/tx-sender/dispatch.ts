import type { SafeInfo, TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeTransaction, TransactionOptions, TransactionResult } from '@safe-global/safe-core-sdk-types'
import type { EthersError } from '@/utils/ethers-utils'
import { didReprice, didRevert } from '@/utils/ethers-utils'
import type { MultiSendCallOnlyEthersContract } from '@safe-global/protocol-kit'
import { type SpendingLimitTxParams } from '@/components/tx-flow/flows/TokenTransfer/ReviewSpendingLimitTx'
import { getSpendingLimitContract } from '@/services/contracts/spendingLimitContracts'
import type { ContractTransactionResponse, Overrides } from 'ethers'
import type { RequestId } from '@safe-global/safe-apps-sdk'
import proposeTx from '../proposeTransaction'
import { txDispatch, TxEvent } from '../txEvents'
import { waitForRelayedTx, waitForTx } from '@/services/tx/txMonitor'
import { getReadOnlyCurrentGnosisSafeContract } from '@/services/contracts/safeContracts'
import { sponsoredCall } from '@/services/tx/relaying'
import {
  getAndValidateSafeSDK,
  getSafeSDKWithSigner,
  getUncheckedSafeSDK,
  assertWalletChain,
  tryOffChainTxSigning,
} from './sdk'
import { createWeb3, getWeb3ReadOnly } from '@/hooks/wallets/web3'
import { type OnboardAPI } from '@web3-onboard/core'
import { asError } from '@/services/exceptions/utils'
import chains from '@/config/chains'

/**
 * Propose a transaction
 * If txId is passed, it's an existing tx being signed
 */
export const dispatchTxProposal = async ({
  chainId,
  safeAddress,
  sender,
  safeTx,
  txId,
  origin,
}: {
  chainId: string
  safeAddress: string
  sender: string
  safeTx: SafeTransaction
  txId?: string
  origin?: string
}): Promise<TransactionDetails> => {
  const safeSDK = getAndValidateSafeSDK()
  const safeTxHash = await safeSDK.getTransactionHash(safeTx)

  let proposedTx: TransactionDetails | undefined
  try {
    proposedTx = await proposeTx(chainId, safeAddress, sender, safeTx, safeTxHash, origin)
  } catch (error) {
    if (txId) {
      txDispatch(TxEvent.SIGNATURE_PROPOSE_FAILED, { txId, error: asError(error) })
    } else {
      txDispatch(TxEvent.PROPOSE_FAILED, { error: asError(error) })
    }
    throw error
  }

  // Dispatch a success event only if the tx is signed
  // Unsigned txs are proposed only temporarily and won't appear in the queue
  if (safeTx.signatures.size > 0) {
    txDispatch(txId ? TxEvent.SIGNATURE_PROPOSED : TxEvent.PROPOSED, {
      txId: proposedTx.txId,
      signerAddress: txId ? sender : undefined,
    })
  }

  return proposedTx
}

/**
 * Sign a transaction
 */
export const dispatchTxSigning = async (
  safeTx: SafeTransaction,
  safeVersion: SafeInfo['version'],
  onboard: OnboardAPI,
  chainId: SafeInfo['chainId'],
  txId?: string,
): Promise<SafeTransaction> => {
  const sdk = await getSafeSDKWithSigner(onboard, chainId)

  let signedTx: SafeTransaction | undefined
  try {
    signedTx = await tryOffChainTxSigning(safeTx, safeVersion, sdk)
  } catch (error) {
    txDispatch(TxEvent.SIGN_FAILED, {
      txId,
      error: asError(error),
    })
    throw error
  }

  txDispatch(TxEvent.SIGNED, { txId })

  return signedTx
}

const ZK_SYNC_ON_CHAIN_SIGNATURE_GAS_LIMIT = 4_500_000

/**
 * On-Chain sign a transaction
 */
export const dispatchOnChainSigning = async (
  safeTx: SafeTransaction,
  txId: string,
  onboard: OnboardAPI,
  chainId: SafeInfo['chainId'],
) => {
  const sdkUnchecked = await getUncheckedSafeSDK(onboard, chainId)
  const safeTxHash = await sdkUnchecked.getTransactionHash(safeTx)
  const eventParams = { txId }

  const options = chainId === chains.zksync ? { gasLimit: ZK_SYNC_ON_CHAIN_SIGNATURE_GAS_LIMIT } : undefined

  try {
    // With the unchecked signer, the contract call resolves once the tx
    // has been submitted in the wallet not when it has been executed
    await sdkUnchecked.approveTransactionHash(safeTxHash, options)

    txDispatch(TxEvent.ONCHAIN_SIGNATURE_REQUESTED, eventParams)
  } catch (err) {
    txDispatch(TxEvent.FAILED, { ...eventParams, error: asError(err) })
    throw err
  }

  txDispatch(TxEvent.ONCHAIN_SIGNATURE_SUCCESS, eventParams)

  // Until the on-chain signature is/has been executed, the safeTx is not
  // signed so we don't return it
}

/**
 * Execute a transaction
 */
export const dispatchTxExecution = async (
  safeTx: SafeTransaction,
  txOptions: TransactionOptions,
  txId: string,
  onboard: OnboardAPI,
  chainId: SafeInfo['chainId'],
  safeAddress: string,
): Promise<string> => {
  const sdkUnchecked = await getUncheckedSafeSDK(onboard, chainId)
  const eventParams = { txId }

  // Execute the tx
  let result: TransactionResult | undefined
  try {
    result = await sdkUnchecked.executeTransaction(safeTx, txOptions)
    txDispatch(TxEvent.EXECUTING, eventParams)
  } catch (error) {
    txDispatch(TxEvent.FAILED, { ...eventParams, error: asError(error) })
    throw error
  }

  txDispatch(TxEvent.PROCESSING, { ...eventParams, txHash: result.hash })

  const provider = getWeb3ReadOnly()

  // Asynchronously watch the tx to be mined/validated
  Promise.race([
    result.transactionResponse
      ?.wait()
      .then((receipt) => {
        if (receipt === null) {
          txDispatch(TxEvent.FAILED, { ...eventParams, error: new Error('No transaction receipt found') })
        } else if (didRevert(receipt)) {
          txDispatch(TxEvent.REVERTED, { ...eventParams, error: new Error('Transaction reverted by EVM') })
        } else {
          txDispatch(TxEvent.PROCESSED, { ...eventParams, safeAddress })
        }
      })
      .catch((err) => {
        const error = err as EthersError

        if (didReprice(error)) {
          txDispatch(TxEvent.PROCESSED, { ...eventParams, safeAddress })
        } else {
          txDispatch(TxEvent.FAILED, { ...eventParams, error: asError(error) })
        }
      }),
    provider ? waitForTx(provider, [txId], result.hash) : undefined,
  ])

  return result.hash
}

export const dispatchBatchExecution = async (
  txs: TransactionDetails[],
  multiSendContract: MultiSendCallOnlyEthersContract,
  multiSendTxData: string,
  onboard: OnboardAPI,
  chainId: SafeInfo['chainId'],
  safeAddress: string,
  overrides: Overrides,
) => {
  const groupKey = multiSendTxData

  let result: TransactionResult | undefined
  const txIds = txs.map((tx) => tx.txId)

  try {
    const wallet = await assertWalletChain(onboard, chainId)

    const provider = createWeb3(wallet.provider)
    result = await multiSendContract.contract.connect(await provider.getSigner()).multiSend(multiSendTxData, overrides)

    txIds.forEach((txId) => {
      txDispatch(TxEvent.EXECUTING, { txId, groupKey })
    })
  } catch (err) {
    txIds.forEach((txId) => {
      txDispatch(TxEvent.FAILED, { txId, error: asError(err), groupKey })
    })
    throw err
  }

  txIds.forEach((txId) => {
    txDispatch(TxEvent.PROCESSING, { txId, txHash: result!.hash, groupKey })
  })

  const provider = getWeb3ReadOnly()

  Promise.race([
    result.transactionResponse
      ?.wait()
      .then((receipt) => {
        if (receipt === null) {
          txs.forEach(({ txId }) => {
            txDispatch(TxEvent.FAILED, {
              txId,
              error: new Error('No transaction receipt found'),
              groupKey,
            })
          })
        } else if (didRevert(receipt)) {
          txIds.forEach((txId) => {
            txDispatch(TxEvent.REVERTED, {
              txId,
              error: new Error('Transaction reverted by EVM'),
              groupKey,
            })
          })
        } else {
          txIds.forEach((txId) => {
            txDispatch(TxEvent.PROCESSED, {
              txId,
              groupKey,
              safeAddress,
            })
          })
        }
      })
      .catch((err) => {
        const error = err as EthersError

        if (didReprice(error)) {
          txIds.forEach((txId) => {
            txDispatch(TxEvent.PROCESSED, {
              txId,
              safeAddress,
            })
          })
        } else {
          txIds.forEach((txId) => {
            txDispatch(TxEvent.FAILED, {
              txId,
              error: asError(err),
              groupKey,
            })
          })
        }
      }),
    provider ? waitForTx(provider, txIds, result.hash) : undefined,
  ])

  return result!.hash
}

export const dispatchSpendingLimitTxExecution = async (
  txParams: SpendingLimitTxParams,
  txOptions: TransactionOptions,
  onboard: OnboardAPI,
  chainId: SafeInfo['chainId'],
  safeAddress: string,
) => {
  const id = JSON.stringify(txParams)

  let result: ContractTransactionResponse | undefined
  try {
    const wallet = await assertWalletChain(onboard, chainId)
    const provider = createWeb3(wallet.provider)
    const contract = getSpendingLimitContract(chainId, await provider.getSigner())

    result = await contract.executeAllowanceTransfer(
      txParams.safeAddress,
      txParams.token,
      txParams.to,
      txParams.amount,
      txParams.paymentToken,
      txParams.payment,
      txParams.delegate,
      txParams.signature,
      txOptions,
    )
    txDispatch(TxEvent.EXECUTING, { groupKey: id })
  } catch (error) {
    txDispatch(TxEvent.FAILED, { groupKey: id, error: asError(error) })
    throw error
  }

  txDispatch(TxEvent.PROCESSING_MODULE, {
    groupKey: id,
    txHash: result.hash,
  })

  result
    ?.wait()
    .then((receipt) => {
      if (receipt === null) {
        txDispatch(TxEvent.FAILED, { groupKey: id, error: new Error('No transaction receipt found') })
      } else if (didRevert(receipt)) {
        txDispatch(TxEvent.REVERTED, {
          groupKey: id,
          error: new Error('Transaction reverted by EVM'),
        })
      } else {
        txDispatch(TxEvent.PROCESSED, { groupKey: id, safeAddress })
      }
    })
    .catch((error) => {
      txDispatch(TxEvent.FAILED, { groupKey: id, error: asError(error) })
    })

  return result?.hash
}

export const dispatchSafeAppsTx = async (
  safeTx: SafeTransaction,
  safeAppRequestId: RequestId,
  onboard: OnboardAPI,
  chainId: SafeInfo['chainId'],
  txId?: string,
): Promise<string> => {
  const sdk = await getSafeSDKWithSigner(onboard, chainId)
  const safeTxHash = await sdk.getTransactionHash(safeTx)
  txDispatch(TxEvent.SAFE_APPS_REQUEST, { safeAppRequestId, safeTxHash, txId })
  return safeTxHash
}

export const dispatchTxRelay = async (
  safeTx: SafeTransaction,
  safe: SafeInfo,
  txId: string,
  gasLimit?: string | number,
) => {
  const readOnlySafeContract = await getReadOnlyCurrentGnosisSafeContract(safe)

  let transactionToRelay = safeTx
  const data = readOnlySafeContract.encode('execTransaction', [
    transactionToRelay.data.to,
    transactionToRelay.data.value,
    transactionToRelay.data.data,
    transactionToRelay.data.operation,
    transactionToRelay.data.safeTxGas,
    transactionToRelay.data.baseGas,
    transactionToRelay.data.gasPrice,
    transactionToRelay.data.gasToken,
    transactionToRelay.data.refundReceiver,
    transactionToRelay.encodedSignatures(),
  ])

  try {
    const relayResponse = await sponsoredCall({ chainId: safe.chainId, to: safe.address.value, data, gasLimit })
    const taskId = relayResponse.taskId

    if (!taskId) {
      throw new Error('Transaction could not be relayed')
    }

    txDispatch(TxEvent.RELAYING, { taskId, txId })

    // Monitor relay tx
    waitForRelayedTx(taskId, [txId], safe.address.value)
  } catch (error) {
    txDispatch(TxEvent.FAILED, { txId, error: asError(error) })
    throw error
  }
}

export const dispatchBatchExecutionRelay = async (
  txs: TransactionDetails[],
  multiSendContract: MultiSendCallOnlyEthersContract,
  multiSendTxData: string,
  chainId: string,
  safeAddress: string,
) => {
  const to = await multiSendContract.getAddress()
  const data = multiSendContract.contract.interface.encodeFunctionData('multiSend', [multiSendTxData])
  const groupKey = multiSendTxData

  let relayResponse
  try {
    relayResponse = await sponsoredCall({
      chainId,
      to,
      data,
    })
  } catch (error) {
    txs.forEach(({ txId }) => {
      txDispatch(TxEvent.FAILED, {
        txId,
        error: asError(error),
        groupKey,
      })
    })
    throw error
  }

  const taskId = relayResponse.taskId
  txs.forEach(({ txId }) => {
    txDispatch(TxEvent.RELAYING, { taskId, txId, groupKey })
  })

  // Monitor relay tx
  waitForRelayedTx(
    taskId,
    txs.map((tx) => tx.txId),
    safeAddress,
    groupKey,
  )
}
