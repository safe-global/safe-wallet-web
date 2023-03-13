import type { SafeInfo, TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeTransaction, TransactionOptions, TransactionResult } from '@safe-global/safe-core-sdk-types'
import type { Web3Provider } from '@ethersproject/providers'
import type { EthersError } from '@/utils/ethers-utils'
import { didReprice, didRevert } from '@/utils/ethers-utils'
import type MultiSendCallOnlyEthersContract from '@safe-global/safe-ethers-lib/dist/src/contracts/MultiSendCallOnly/MultiSendCallOnlyEthersContract'
import type { SpendingLimitTxParams } from '@/components/tx/modals/TokenTransferModal/ReviewSpendingLimitTx'
import { getSpendingLimitContract } from '@/services/contracts/spendingLimitContracts'
import type { ContractTransaction } from 'ethers'
import type { RequestId } from '@safe-global/safe-apps-sdk'
import proposeTx from '../proposeTransaction'
import { txDispatch, TxEvent } from '../txEvents'
import { getAndValidateSafeSDK, getUncheckedSafeSDK, tryOffChainSigning } from './sdk'

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
      txDispatch(TxEvent.SIGNATURE_PROPOSE_FAILED, { txId, error: error as Error })
    } else {
      txDispatch(TxEvent.PROPOSE_FAILED, { error: error as Error })
    }
    throw error
  }

  txDispatch(txId ? TxEvent.SIGNATURE_PROPOSED : TxEvent.PROPOSED, {
    txId: proposedTx.txId,
    signerAddress: txId ? sender : undefined,
  })

  return proposedTx
}

/**
 * Sign a transaction
 */
export const dispatchTxSigning = async (
  safeTx: SafeTransaction,
  safeVersion: SafeInfo['version'],
  txId?: string,
): Promise<SafeTransaction | undefined> => {
  let signedTx: SafeTransaction | undefined
  try {
    signedTx = await tryOffChainSigning(safeTx, safeVersion)
  } catch (error) {
    txDispatch(TxEvent.SIGN_FAILED, { txId, error: error as Error })
    throw error
  }

  txDispatch(TxEvent.SIGNED, { txId })

  return signedTx
}

/**
 * On-Chain sign a transaction
 */
export const dispatchOnChainSigning = async (safeTx: SafeTransaction, provider: Web3Provider, txId: string) => {
  const sdkUnchecked = await getUncheckedSafeSDK(provider)
  const safeTxHash = await sdkUnchecked.getTransactionHash(safeTx)
  const eventParams = { txId }

  try {
    // With the unchecked signer, the contract call resolves once the tx
    // has been submitted in the wallet not when it has been executed
    await sdkUnchecked.approveTransactionHash(safeTxHash)
    txDispatch(TxEvent.ONCHAIN_SIGNATURE_REQUESTED, eventParams)
  } catch (err) {
    txDispatch(TxEvent.FAILED, { ...eventParams, error: err as Error })
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
  provider: Web3Provider,
  txOptions: TransactionOptions,
  txId: string,
): Promise<string> => {
  const sdkUnchecked = await getUncheckedSafeSDK(provider)
  const eventParams = { txId }

  // Execute the tx
  let result: TransactionResult | undefined
  try {
    result = await sdkUnchecked.executeTransaction(safeTx, txOptions)
    txDispatch(TxEvent.EXECUTING, eventParams)
  } catch (error) {
    txDispatch(TxEvent.FAILED, { ...eventParams, error: error as Error })
    throw error
  }

  txDispatch(TxEvent.PROCESSING, { ...eventParams, txHash: result.hash })

  // Asynchronously watch the tx to be mined/validated
  result.transactionResponse
    ?.wait()
    .then((receipt) => {
      if (didRevert(receipt)) {
        txDispatch(TxEvent.REVERTED, { ...eventParams, error: new Error('Transaction reverted by EVM') })
      } else {
        txDispatch(TxEvent.PROCESSED, eventParams)
      }
    })
    .catch((err) => {
      const error = err as EthersError

      if (didReprice(error)) {
        txDispatch(TxEvent.PROCESSED, { ...eventParams })
      } else {
        txDispatch(TxEvent.FAILED, { ...eventParams, error: error as Error })
      }
    })

  return result.hash
}

export const dispatchBatchExecution = async (
  txs: TransactionDetails[],
  multiSendContract: MultiSendCallOnlyEthersContract,
  multiSendTxData: string,
  provider: Web3Provider,
) => {
  const groupKey = multiSendTxData

  let result: TransactionResult | undefined

  try {
    result = await multiSendContract.contract.connect(provider.getSigner()).multiSend(multiSendTxData)
    txs.forEach(({ txId }) => {
      txDispatch(TxEvent.EXECUTING, { txId, groupKey })
    })
  } catch (err) {
    txs.forEach(({ txId }) => {
      txDispatch(TxEvent.FAILED, { txId, error: err as Error, groupKey })
    })
    throw err
  }

  txs.forEach(({ txId }) => {
    txDispatch(TxEvent.PROCESSING, { txId, txHash: result!.hash, groupKey })
  })

  result!.transactionResponse
    ?.wait()
    .then((receipt) => {
      if (didRevert(receipt)) {
        txs.forEach(({ txId }) => {
          txDispatch(TxEvent.REVERTED, {
            txId,
            error: new Error('Transaction reverted by EVM'),
            groupKey,
          })
        })
      } else {
        txs.forEach(({ txId }) => {
          txDispatch(TxEvent.PROCESSED, {
            txId,
            groupKey,
          })
        })
      }
    })
    .catch((err) => {
      const error = err as EthersError

      if (didReprice(error)) {
        txs.forEach(({ txId }) => {
          txDispatch(TxEvent.PROCESSED, { txId })
        })
      } else {
        txs.forEach(({ txId }) => {
          txDispatch(TxEvent.FAILED, {
            txId,
            error: err as Error,
            groupKey,
          })
        })
      }
    })

  return result!.hash
}

export const dispatchSpendingLimitTxExecution = async (
  txParams: SpendingLimitTxParams,
  txOptions: TransactionOptions,
  chainId: string,
  provider: Web3Provider,
) => {
  const contract = getSpendingLimitContract(chainId, provider.getSigner())

  const id = JSON.stringify(txParams)

  let result: ContractTransaction | undefined
  try {
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
    txDispatch(TxEvent.FAILED, { groupKey: id, error: error as Error })
    throw error
  }

  txDispatch(TxEvent.PROCESSING_MODULE, {
    groupKey: id,
    txHash: result.hash,
  })

  result
    ?.wait()
    .then((receipt) => {
      if (didRevert(receipt)) {
        txDispatch(TxEvent.REVERTED, { groupKey: id, error: new Error('Transaction reverted by EVM') })
      } else {
        txDispatch(TxEvent.PROCESSED, { groupKey: id })
      }
    })
    .catch((error) => {
      txDispatch(TxEvent.FAILED, { groupKey: id, error: error as Error })
    })

  return result?.hash
}

export const dispatchSafeAppsTx = async (safeTx: SafeTransaction, safeAppRequestId: RequestId) => {
  const sdk = getAndValidateSafeSDK()
  const safeTxHash = await sdk.getTransactionHash(safeTx)
  txDispatch(TxEvent.SAFE_APPS_REQUEST, { safeAppRequestId, safeTxHash })
}
