import type { SafeTransactionEstimation, TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'
import { getTransactionDetails, Operation, postSafeGasEstimation } from '@gnosis.pm/safe-react-gateway-sdk'
import type {
  MetaTransactionData,
  SafeTransaction,
  SafeTransactionDataPartial,
  TransactionOptions,
  TransactionResult,
} from '@gnosis.pm/safe-core-sdk-types'
import type { RequestId } from '@gnosis.pm/safe-apps-sdk'
import extractTxInfo from '@/services/tx/extractTxInfo'
import proposeTx from './proposeTransaction'
import { txDispatch, TxEvent } from './txEvents'
import { getSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import type { EthersError } from '@/utils/ethers-utils'
import { didReprice, didRevert } from '@/utils/ethers-utils'
import type { RemoveOwnerTxParams } from '@gnosis.pm/safe-core-sdk'
import type Safe from '@gnosis.pm/safe-core-sdk'
import type { AddOwnerTxParams, SwapOwnerTxParams } from '@gnosis.pm/safe-core-sdk/dist/src/Safe'
import type MultiSendCallOnlyEthersContract from '@gnosis.pm/safe-ethers-lib/dist/src/contracts/MultiSendCallOnly/MultiSendCallOnlyEthersContract'
import type { Web3Provider } from '@ethersproject/providers'
import type { ContractTransaction } from 'ethers'
import { ethers } from 'ethers'
import type { SpendingLimitTxParams } from '@/components/tx/modals/TokenTransferModal/ReviewSpendingLimitTx'
import { getSpendingLimitContract } from '@/services/contracts/spendingLimitContracts'
import EthersAdapter from '@gnosis.pm/safe-ethers-lib'
import { Errors, logError } from '@/services/exceptions'
import { EMPTY_DATA } from '@gnosis.pm/safe-core-sdk/dist/src/utils/constants'

const getAndValidateSafeSDK = (): Safe => {
  const safeSDK = getSafeSDK()
  if (!safeSDK) {
    throw new Error('The Safe SDK could not be initialized. Please be aware that we only support v1.1.1 Safes and up.')
  }
  return safeSDK
}

/**
 * https://docs.ethers.io/v5/api/providers/jsonrpc-provider/#UncheckedJsonRpcSigner
 * This resolves the promise sooner when executing a tx and mocks
 * most of the values of transactionResponse which is needed when
 * dealing with smart-contract wallet owners
 */
const getUncheckedSafeSDK = (provider: Web3Provider): Promise<Safe> => {
  const sdk = getAndValidateSafeSDK()

  const signer = provider.getSigner()
  const ethAdapter = new EthersAdapter({
    ethers,
    signer: signer.connectUnchecked(),
  })

  return sdk.connect({ ethAdapter })
}

const estimateSafeTxGas = async (
  chainId: string,
  safeAddress: string,
  txParams: MetaTransactionData,
): Promise<SafeTransactionEstimation> => {
  return postSafeGasEstimation(chainId, safeAddress, {
    to: txParams.to,
    value: txParams.value,
    data: txParams.data,
    operation: (txParams.operation as unknown as Operation) || Operation.CALL,
  })
}

const getRecommendedTxParams = async (
  txParams: SafeTransactionDataPartial,
): Promise<{ nonce: number; safeTxGas: number } | undefined> => {
  const safeSDK = getAndValidateSafeSDK()
  const chainId = await safeSDK.getChainId()
  const safeAddress = safeSDK.getAddress()
  let estimation: SafeTransactionEstimation | undefined

  try {
    estimation = await estimateSafeTxGas(String(chainId), safeAddress, txParams)
  } catch (e) {
    try {
      // If the initial transaction data causes the estimation to fail,
      // we retry the request with a cancellation transaction to get the
      // recommendedNonce, even if the original transaction will likely fail
      const cancellationTxParams = { ...txParams, data: EMPTY_DATA, to: safeAddress, value: '0' }
      estimation = await estimateSafeTxGas(String(chainId), safeAddress, cancellationTxParams)
    } catch (e) {
      logError(Errors._616, (e as Error).message)
      return
    }
  }

  return {
    nonce: estimation.recommendedNonce,
    safeTxGas: Number(estimation.safeTxGas),
  }
}

/**
 * Create a transaction from raw params
 */
export const createTx = async (txParams: SafeTransactionDataPartial, nonce?: number): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()

  // If the nonce is not provided, we get the recommended one
  if (nonce === undefined) {
    const recParams = (await getRecommendedTxParams(txParams)) || {}
    txParams = { ...txParams, ...recParams }
  } else {
    // Otherwise, we use the provided one
    txParams = { ...txParams, nonce }
  }

  return safeSDK.createTransaction({ safeTransactionData: txParams })
}

/**
 * Create a multiSendCallOnly transaction from an array of MetaTransactionData and options
 *
 * If only one tx is passed it will be created without multiSend and without onlyCalls.
 */
export const createMultiSendCallOnlyTx = async (txParams: MetaTransactionData[]): Promise<SafeTransaction> => {
  return withRecommendedNonce((safeSDK) =>
    safeSDK.createTransaction({
      safeTransactionData: txParams,
      onlyCalls: true,
    }),
  )
}

const withRecommendedNonce = async (
  createFn: (safeSDK: Safe) => Promise<SafeTransaction>,
): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()
  const tx = await createFn(safeSDK)
  return createTx(tx.data)
}

export const createRemoveOwnerTx = async (txParams: RemoveOwnerTxParams): Promise<SafeTransaction> => {
  return withRecommendedNonce((safeSDK) => safeSDK.createRemoveOwnerTx(txParams))
}

export const createAddOwnerTx = async (txParams: AddOwnerTxParams): Promise<SafeTransaction> => {
  return withRecommendedNonce((safeSDK) => safeSDK.createAddOwnerTx(txParams))
}

export const createSwapOwnerTx = async (txParams: SwapOwnerTxParams): Promise<SafeTransaction> => {
  return withRecommendedNonce((safeSDK) => safeSDK.createSwapOwnerTx(txParams))
}

export const createUpdateThresholdTx = async (threshold: number): Promise<SafeTransaction> => {
  return withRecommendedNonce((safeSDK) => safeSDK.createChangeThresholdTx(threshold))
}

export const createRemoveModuleTx = async (moduleAddress: string): Promise<SafeTransaction> => {
  return withRecommendedNonce((safeSDK) => safeSDK.createDisableModuleTx(moduleAddress))
}

export const createRemoveGuardTx = async (): Promise<SafeTransaction> => {
  return withRecommendedNonce((safeSDK) => safeSDK.createDisableGuardTx())
}

/**
 * Create a rejection tx
 */
export const createRejectTx = async (nonce: number): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()
  return safeSDK.createRejectionTransaction(nonce)
}

/**
 * Prepare a SafeTransaction from Client Gateway / Tx Queue
 */
export const createExistingTx = async (
  chainId: string,
  safeAddress: string,
  txId: string,
  txDetails?: TransactionDetails,
): Promise<SafeTransaction> => {
  // Get the tx details from the backend if not provided
  txDetails = txDetails || (await getTransactionDetails(chainId, txId))

  // Convert them to the Core SDK tx params
  const { txParams, signatures } = extractTxInfo(txDetails, safeAddress)

  // Create a tx and add pre-approved signatures
  const safeTx = await createTx(txParams, txParams.nonce)
  Object.entries(signatures).forEach(([signer, data]) => {
    safeTx.addSignature({ signer, data, staticPart: () => data, dynamicPart: () => '' })
  })

  return safeTx
}

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
  shouldEthSign: boolean,
  txId?: string,
): Promise<SafeTransaction> => {
  const sdk = getAndValidateSafeSDK()
  const signingMethod = shouldEthSign ? 'eth_sign' : 'eth_signTypedData'

  let signedTx: SafeTransaction | undefined
  try {
    signedTx = await sdk.signTransaction(safeTx, signingMethod)
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

  try {
    // With the unchecked signer, the contract call resolves once the tx
    // has been submitted in the wallet not when it has been executed
    await sdkUnchecked.approveTransactionHash(safeTxHash)
  } catch (err) {
    txDispatch(TxEvent.FAILED, { txId, error: err as Error })
    throw err
  }

  txDispatch(TxEvent.AWAITING_ON_CHAIN_SIGNATURE, { txId })

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

  txDispatch(TxEvent.EXECUTING, { txId })

  // Execute the tx
  let result: TransactionResult | undefined
  try {
    result = await sdkUnchecked.executeTransaction(safeTx, txOptions)
  } catch (error) {
    txDispatch(TxEvent.FAILED, { txId, error: error as Error })
    throw error
  }

  txDispatch(TxEvent.PROCESSING, { txId, txHash: result.hash })

  // Asynchronously watch the tx to be mined/validated
  result.transactionResponse
    ?.wait()
    .then((receipt) => {
      if (didRevert(receipt)) {
        txDispatch(TxEvent.REVERTED, { txId, receipt, error: new Error('Transaction reverted by EVM') })
      } else {
        txDispatch(TxEvent.PROCESSED, { txId, receipt })
      }
    })
    .catch((err) => {
      const error = err as EthersError

      if (didReprice(error)) {
        txDispatch(TxEvent.PROCESSED, { txId, receipt: error.receipt })
      } else {
        txDispatch(TxEvent.FAILED, { txId, error: error as Error })
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

  txs.forEach(({ txId }) => {
    txDispatch(TxEvent.EXECUTING, { txId, groupKey })
  })

  let result: TransactionResult | undefined

  try {
    result = await multiSendContract.contract.connect(provider.getSigner()).multiSend(multiSendTxData)
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
            receipt,
            error: new Error('Transaction reverted by EVM'),
            groupKey,
          })
        })
      } else {
        txs.forEach(({ txId }) => {
          txDispatch(TxEvent.PROCESSED, {
            txId,
            receipt,
            groupKey,
          })
        })
      }
    })
    .catch((err) => {
      const error = err as EthersError

      if (didReprice(error)) {
        txs.forEach(({ txId }) => {
          txDispatch(TxEvent.PROCESSED, { txId, receipt: error.receipt })
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

  txDispatch(TxEvent.EXECUTING, { groupKey: id })

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
        txDispatch(TxEvent.REVERTED, { groupKey: id, receipt, error: new Error('Transaction reverted by EVM') })
      } else {
        txDispatch(TxEvent.PROCESSED, { groupKey: id, receipt })
      }
    })
    .catch((error) => {
      txDispatch(TxEvent.FAILED, { groupKey: id, error: error as Error })
    })

  return result?.hash
}

export const dispatchSafeAppsTx = (txId: string, safeAppRequestId: RequestId) => {
  txDispatch(TxEvent.SAFE_APPS_REQUEST, { txId, safeAppRequestId })
}
