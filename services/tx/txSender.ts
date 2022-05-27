import { getTransactionDetails, TransactionDetails, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { SafeTransaction, SafeTransactionDataPartial, TransactionResult } from '@gnosis.pm/safe-core-sdk-types'
import extractTxInfo from '@/services/tx/extractTxInfo'
import proposeTx from './proposeTransaction'
import { txDispatch, TxEvent } from './txEvents'
import { getSafeSDK } from '../safe-core/safeCoreSDK'
import { ContractReceipt } from 'ethers/lib/ethers'

/**
 * Create a transaction from raw params
 */
export const createTx = async (txParams: SafeTransactionDataPartial): Promise<SafeTransaction> => {
  const safeSDK = getSafeSDK()
  return await safeSDK.createTransaction(txParams)
}

/**
 * Create a rejection tx
 */
export const createRejectTx = async (nonce: number): Promise<SafeTransaction> => {
  const safeSDK = getSafeSDK()
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
  txDispatch(TxEvent.PROPOSED, { txId: proposedTx.txId, tx: safeTx })

  return proposedTx
}

/**
 * Sign a transaction
 */
export const dispatchTxSigning = async (safeTx: SafeTransaction, txId?: string): Promise<SafeTransaction> => {
  const sdk = getSafeSDK()

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
export const dispatchTxExecution = async (safeTx: SafeTransaction, txId: string): Promise<string> => {
  const sdk = getSafeSDK()

  txDispatch(TxEvent.EXECUTING, { txId, tx: safeTx })

  let result: TransactionResult | undefined
  try {
    // Execute the tx
    result = await sdk.executeTransaction(safeTx)
  } catch (error) {
    txDispatch(TxEvent.FAILED, { txId, tx: safeTx, error: error as Error })
    throw error
  }

  txDispatch(TxEvent.MINING, { txId, txHash: result.hash, tx: safeTx })

  try {
    // Await for tx to be mined
    const receipt = (await result.transactionResponse?.wait()) as ContractReceipt

    const didRevert = receipt.status === 0
    if (didRevert) {
      txDispatch(TxEvent.REVERTED, { txId, receipt, tx: safeTx, error: new Error('Transaction reverted by EVM') })
    } else {
      txDispatch(TxEvent.MINED, { txId, tx: safeTx, receipt })
    }
  } catch (error) {
    txDispatch(TxEvent.FAILED, { txId, tx: safeTx, error: error as Error })
    throw error
  }

  return result.hash
}
