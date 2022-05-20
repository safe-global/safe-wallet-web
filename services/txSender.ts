import {
  getTransactionDetails,
  type TransactionDetails,
  type TransactionSummary,
} from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeTransaction, SafeTransactionDataPartial, TransactionResult } from '@gnosis.pm/safe-core-sdk-types'
import { createTransaction, executeTransaction, signTransaction } from '@/services/createTransaction'
import extractTxInfo from '@/services/extractTxInfo'
import proposeTx from './proposeTransaction'
import { txDispatch, TxEvent } from './txEvents'
import type { ContractReceipt } from 'ethers/lib/ethers'

export const dispatchTxCreation = async (
  chainId: string,
  safeAddress: string,
  sender: string,
  txParams: SafeTransactionDataPartial,
): Promise<TransactionDetails | undefined> => {
  let tx: SafeTransaction | undefined
  try {
    tx = await createTransaction(txParams)
  } catch (error) {
    throw error
  }
  txDispatch(TxEvent.CREATED, { tx })

  let signedTx: SafeTransaction | undefined
  try {
    signedTx = await signTransaction(tx)
  } catch (error) {
    txDispatch(TxEvent.SIGN_FAILED, { tx, error: error as Error })
    throw error
  }
  txDispatch(TxEvent.SIGNED, { tx: signedTx })

  let proposedTx: TransactionDetails | undefined
  try {
    proposedTx = await proposeTx(chainId, safeAddress, sender, signedTx)
  } catch (error) {
    txDispatch(TxEvent.PROPOSE_FAILED, { tx: signedTx, error: error as Error })
    throw error
  }
  txDispatch(TxEvent.PROPOSED, { txId: proposedTx.txId })

  return proposedTx
}

export const dispatchTxExecution = async (
  chainId: string,
  safeAddress: string,
  txSummary: TransactionSummary,
): Promise<string> => {
  const txId = txSummary.id
  let result: TransactionResult | undefined

  txDispatch(TxEvent.EXECUTING, { txId })

  try {
    // Get the tx details from the backend
    const txDetails = await getTransactionDetails(chainId, txId)

    // Convert them to the Core SDK tx params
    const { txParams, signatures } = extractTxInfo(txSummary, txDetails, safeAddress)

    // Create a tx and add pre-approved signatures
    const safeTx = await createTransaction(txParams)
    Object.entries(signatures).forEach(([signer, data]) => {
      safeTx.addSignature({ signer, data, staticPart: () => data, dynamicPart: () => '' })
    })

    // Execute the tx
    result = await executeTransaction(safeTx)
  } catch (error) {
    txDispatch(TxEvent.FAILED, { txId, error: error as Error })
    throw error
  }

  txDispatch(TxEvent.MINING, { txId, txHash: result.hash })

  try {
    // Await for tx to be mined
    const receipt = (await result.transactionResponse?.wait()) as ContractReceipt

    const didRevert = receipt.status === 0
    if (didRevert) {
      txDispatch(TxEvent.REVERTED, { txId, receipt, error: new Error('Transaction reverted by EVM') })
    } else {
      txDispatch(TxEvent.MINED, { txId, receipt })
    }
  } catch (error) {
    txDispatch(TxEvent.FAILED, { txId, error: error as Error })
    throw error
  }

  return result.hash
}
