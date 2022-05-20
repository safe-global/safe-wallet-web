import { getTransactionDetails, TransactionDetails, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { SafeTransaction, TransactionResult } from '@gnosis.pm/safe-core-sdk-types'
import { createTransaction, executeTransaction, signTransaction } from '@/services/createTransaction'
import extractTxInfo from '@/services/extractTxInfo'
import proposeTx from './proposeTransaction'
import { txDispatch, TxEvent } from './txEvents'

/**
 * Prepare a SafeTransaction from Client Gateway / Tx Queue
 */
export const prepareTx = async (
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
  const safeTx = await createTransaction(txParams)
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
export const dispatchTxSigning = async (safeTx: SafeTransaction, id?: string): Promise<SafeTransaction> => {
  const txId = id || JSON.stringify(safeTx)

  let signedTx: SafeTransaction | undefined
  try {
    signedTx = await signTransaction(safeTx)
  } catch (error) {
    txDispatch(TxEvent.SIGN_FAILED, { txId, tx: safeTx, error: error as Error })
    throw error
  }
  txDispatch(TxEvent.SIGNED, { txId, tx: signedTx })

  return signedTx
}

/**
 * Execute a transaction
 */
export const dispatchTxExecution = async (safeTx: SafeTransaction, id?: string): Promise<string> => {
  const txId = id || JSON.stringify(safeTx)

  let result: TransactionResult | undefined

  txDispatch(TxEvent.EXECUTING, { txId, tx: safeTx })

  try {
    // Execute the tx
    result = await executeTransaction(safeTx)
  } catch (error) {
    txDispatch(TxEvent.FAILED, { txId, tx: safeTx, error: error as Error })
    throw error
  }

  // Subscribe to eth tx events
  result.promiEvent
    ?.once('transactionHash', (txHash) => {
      txDispatch(TxEvent.MINING, { txId, txHash, tx: safeTx })
    })
    ?.once('receipt', (receipt) => {
      const didRevert = receipt.status === false
      if (didRevert) {
        txDispatch(TxEvent.REVERTED, { txId, tx: safeTx, receipt, error: new Error('Transaction reverted by EVM') })
      } else {
        txDispatch(TxEvent.MINED, { txId, receipt, tx: safeTx })
      }
    })
    ?.once('error', (error) => {
      txDispatch(TxEvent.FAILED, { txId, tx: safeTx, error })
    })

  return result.hash
}
