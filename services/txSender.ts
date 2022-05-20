import { getTransactionDetails, TransactionDetails, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { SafeTransaction, SafeTransactionDataPartial } from '@gnosis.pm/safe-core-sdk-types'
import { createTransaction, executeTransaction, signTransaction } from '@/services/createTransaction'
import extractTxInfo from '@/services/extractTxInfo'
import { CodedException, Errors } from '@/services/exceptions'
import { AppThunk } from '@/store'
import {
  setTxFailed,
  setTxMined,
  setTxMining,
  setTxProposalFailed,
  setTxSigningFailed,
  setTxSubmitting,
} from '@/store/pendingTxsSlice'
import proposeTx from './proposeTransaction'

export const dispatchTxCreation = (
  chainId: string,
  safeAddress: string,
  txParams: SafeTransactionDataPartial,
): AppThunk<Promise<TransactionDetails | undefined>> => {
  return async (dispatch) => {
    let signedTx: SafeTransaction | undefined
    try {
      const tx = await createTransaction(txParams)
      signedTx = await signTransaction(tx)
    } catch (err) {
      dispatch(setTxSigningFailed({ error: err as Error }))
    }

    if (!signedTx) return

    try {
      return await proposeTx(chainId, safeAddress, signedTx)
    } catch (err) {
      dispatch(setTxProposalFailed({ error: err as Error }))
    }
  }
}

export const dispatchTxExecution = (chainId: string, safeAddress: string, txSummary: TransactionSummary): AppThunk => {
  return async (dispatch) => {
    const txId = txSummary.id

    try {
      const txDetails = await getTransactionDetails(chainId, txId)
      const { txParams, signatures } = extractTxInfo(txSummary, txDetails, safeAddress)

      const safeTx = await createTransaction(txParams)
      Object.entries(signatures).forEach(([signer, data]) => {
        safeTx.addSignature({ signer, data, staticPart: () => data, dynamicPart: () => '' })
      })

      const { promiEvent } = await executeTransaction(safeTx)

      dispatch(setTxSubmitting({ txId }))

      promiEvent
        ?.once('transactionHash', (txHash) => {
          dispatch(setTxMining({ txId, txHash }))
        })
        ?.once('receipt', (receipt) => {
          dispatch(setTxMined({ txId, receipt }))
        })
        ?.once('error', (error) => {
          dispatch(setTxFailed({ txId, error }))
        })
    } catch (err) {
      const error = new CodedException(Errors._804, (err as Error).message)

      dispatch(setTxFailed({ txId, error }))
    }
  }
}
