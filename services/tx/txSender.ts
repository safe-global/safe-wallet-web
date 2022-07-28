import {
  getTransactionDetails,
  Operation,
  postSafeGasEstimation,
  SafeTransactionEstimation,
  TransactionDetails,
  TransactionSummary,
} from '@gnosis.pm/safe-react-gateway-sdk'
import {
  MetaTransactionData,
  SafeTransaction,
  SafeTransactionDataPartial,
  TransactionOptions,
  TransactionResult,
} from '@gnosis.pm/safe-core-sdk-types'
import extractTxInfo from '@/services/tx/extractTxInfo'
import proposeTx from './proposeTransaction'
import { txDispatch, TxEvent } from './txEvents'
import { getSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { didRevert } from '@/utils/ethers-utils'
import Safe, { RemoveOwnerTxParams, SafeTransactionOptionalProps } from '@gnosis.pm/safe-core-sdk'

const getAndValidateSafeSDK = (): Safe => {
  const safeSDK = getSafeSDK()
  if (!safeSDK) {
    throw new Error('Safe SDK not initialized')
  }
  return safeSDK
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

/**
 * Create a transaction from raw params
 */
export const createTx = async (txParams: SafeTransactionDataPartial): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()
  // Get the nonce and safeTxGas if not provided
  if (txParams.nonce === undefined) {
    const chainId = await safeSDK.getChainId()
    const estimaton = await estimateSafeTxGas(String(chainId), safeSDK.getAddress(), txParams)
    txParams = { ...txParams, nonce: estimaton.recommendedNonce, safeTxGas: Number(estimaton.safeTxGas) }
  }

  return safeSDK.createTransaction(txParams)
}

/**
 * Create a multiSend transaction from an array of MetaTransactionData and options
 *
 * If only one tx is passed it will be created without multiSend.
 */
export const createMultiSendTx = async (
  txParams: MetaTransactionData[],
  options?: SafeTransactionOptionalProps,
): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()

  return safeSDK.createTransaction(txParams, options)
}

export const createRemoveOwnerTx = async (txParams: RemoveOwnerTxParams): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()
  return safeSDK.getRemoveOwnerTx(txParams)
}

export const createUpdateThresholdTx = async (threshold: number): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()

  return safeSDK.getChangeThresholdTx(threshold)
}

/**
 * Create a rejection tx
 */
export const createRejectTx = async (nonce: number): Promise<SafeTransaction> => {
  const safeSDK = getAndValidateSafeSDK()
  return safeSDK.createRejectionTransaction(nonce)
}

/**
 * Update tx nonce
 */
export const updateTxNonce = async (tx: SafeTransaction, nonce: number): Promise<SafeTransaction> => {
  return createTx({ ...tx.data, nonce })
}

/**
 * Prepare a SafeTransaction from Client Gateway / Tx Queue
 */
export const createExistingTx = async (
  chainId: string,
  safeAddress: string,
  txSummary: TransactionSummary,
  txDetails?: TransactionDetails,
): Promise<SafeTransaction> => {
  // Get the tx details from the backend if not provided
  txDetails = txDetails || (await getTransactionDetails(chainId, txSummary.id))

  // Convert them to the Core SDK tx params
  const { txParams, signatures } = extractTxInfo(txSummary, txDetails, safeAddress)

  // Create a tx and add pre-approved signatures
  const safeTx = await createTx(txParams)
  Object.entries(signatures).forEach(([signer, data]) => {
    safeTx.addSignature({ signer, data, staticPart: () => data, dynamicPart: () => '' })
  })

  return safeTx
}

/**
 * Propose a transaction
 */
export const dispatchTxProposal = async (
  chainId: string,
  safeAddress: string,
  sender: string,
  safeTx: SafeTransaction,
): Promise<TransactionDetails> => {
  const safeSDK = getAndValidateSafeSDK()
  const safeTxHash = await safeSDK.getTransactionHash(safeTx)

  let proposedTx: TransactionDetails | undefined
  try {
    proposedTx = await proposeTx(chainId, safeAddress, sender, safeTx, safeTxHash)
  } catch (error) {
    txDispatch(TxEvent.PROPOSE_FAILED, { tx: safeTx, error: error as Error })
    throw error
  }

  txDispatch(TxEvent.PROPOSED, { txId: proposedTx.txId, tx: safeTx })

  return proposedTx
}

/**
 * Sign a transaction
 */
export const dispatchTxSigning = async (
  safeTx: SafeTransaction,
  isHardwareWallet: boolean,
  txId?: string,
): Promise<SafeTransaction> => {
  const sdk = getAndValidateSafeSDK()
  const signingMethod = isHardwareWallet ? 'eth_sign' : 'eth_signTypedData'

  try {
    // Add signature to safeTx
    await sdk.signTransaction(safeTx, signingMethod)
  } catch (error) {
    txDispatch(TxEvent.SIGN_FAILED, { txId, tx: safeTx, error: error as Error })
    throw error
  }
  txDispatch(TxEvent.SIGNED, { txId, tx: safeTx })

  return safeTx
}

/**
 * Execute a transaction
 */
export const dispatchTxExecution = async (
  txId: string,
  safeTx: SafeTransaction,
  txOptions?: TransactionOptions,
): Promise<string> => {
  const sdk = getAndValidateSafeSDK()

  txDispatch(TxEvent.EXECUTING, { txId, tx: safeTx })

  // Execute the tx
  let result: TransactionResult | undefined
  try {
    // @FIXME: clone the tx to avoid mutating the original
    // Should be fixed on the Core SDK side
    const tx = !safeTx.signatures.size ? await createTx({ ...safeTx.data }) : safeTx

    result = await sdk.executeTransaction(tx, txOptions)
  } catch (error) {
    txDispatch(TxEvent.FAILED, { txId, tx: safeTx, error: error as Error })
    throw error
  }

  txDispatch(TxEvent.MINING, { txId, txHash: result.hash, tx: safeTx })

  // Asynchronously watch the tx to be mined
  result.transactionResponse
    ?.wait()
    .then((receipt) => {
      if (didRevert(receipt)) {
        txDispatch(TxEvent.REVERTED, { txId, receipt, tx: safeTx, error: new Error('Transaction reverted by EVM') })
      } else {
        txDispatch(TxEvent.MINED, { txId, tx: safeTx, receipt })
      }
    })
    .catch((error) => {
      txDispatch(TxEvent.FAILED, { txId, tx: safeTx, error: error as Error })
    })

  return result.hash
}
