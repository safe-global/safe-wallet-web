import { ReactElement } from 'react'
import { getTransactionDetails, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Typography } from '@mui/material'

import { createTransaction, executeTransaction } from '@/services/createTransaction'
import extractTxInfo from '@/services/extractTxInfo'
import useSafeAddress from '@/services/useSafeAddress'
import css from './styles.module.css'
import { CodedException, Errors } from '@/services/exceptions'
import { AppThunk, useAppDispatch } from '@/store'
import { setTxFailed, setTxMined, setTxMining, setTxSubmitting } from '@/store/pendingTxsSlice'

export const executeTx = (chainId: string, txSummary: TransactionSummary, safeAddress: string): AppThunk => {
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

const ExecuteProposedTx = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const { chainId, address } = useSafeAddress()
  const dispatch = useAppDispatch()

  const onExecute = async () => dispatch(executeTx(chainId, txSummary, address))

  return (
    <div className={css.container}>
      <Typography variant="h6">Execute transaction</Typography>

      <div>Transaction id</div>
      <pre style={{ overflow: 'auto', width: '100%' }}>{txSummary.id}</pre>

      <div className={css.submit}>
        <Button variant="contained" onClick={onExecute}>
          Submit
        </Button>
      </div>
    </div>
  )
}

export default ExecuteProposedTx
