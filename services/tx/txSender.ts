import { getTransactionDetails, TransactionDetails, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
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
import { SafeTransactionOptionalProps } from '@gnosis.pm/safe-core-sdk'

/**
 * Create a transaction from raw params
 */
export const createTx = async (txParams: SafeTransactionDataPartial): Promise<SafeTransaction> => {
  const safeSDK = getSafeSDK()
  if (!safeSDK) {
    throw new Error('Safe SDK not initialized')
  }
  return await safeSDK.createTransaction(txParams)
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
  const safeSDK = getSafeSDK()
  if (!safeSDK) {
    throw new Error('Safe SDK not initialized')
  }
  return await safeSDK.createTransaction(txParams)
}

/**
 * Create a rejection tx
 */
export const createRejectTx = async (nonce: number): Promise<SafeTransaction> => {
  const safeSDK = getSafeSDK()
  if (!safeSDK) {
    throw new Error('Safe SDK not initialized')
  }
  return await safeSDK.createRejectionTransaction(nonce)
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
  let proposedTx: TransactionDetails | undefined
  try {
    proposedTx = await proposeTx(chainId, safeAddress, sender, safeTx)
  } catch (error) {
    txDispatch(TxEvent.PROPOSE_FAILED, { tx: safeTx, error: error as Error })
    throw error
  }

  // N.B.: proposals w/o signatures (i.e. immediate execution in 1/1 Safes) won't appear in the queue
  txDispatch(TxEvent.PROPOSED, { txId: proposedTx.txId, tx: safeTx })

  return proposedTx
}

/**
 * Sign a transaction
 */
export const dispatchTxSigning = async (safeTx: SafeTransaction, txId?: string): Promise<SafeTransaction> => {
  const sdk = getSafeSDK()
  if (!sdk) {
    throw new Error('Safe SDK not initialized')
  }

  try {
    // Adds signatures to safeTx
    await sdk.signTransaction(safeTx)
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
  const sdk = getSafeSDK()
  if (!sdk) {
    throw new Error('Safe SDK not initialized')
  }

  txDispatch(TxEvent.EXECUTING, { txId, tx: safeTx })

  // Execute the tx
  let result: TransactionResult | undefined
  try {
    result = await sdk.executeTransaction(safeTx, txOptions)
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
