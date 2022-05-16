import { ReactElement } from 'react'
import { getTransactionDetails, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Typography } from '@mui/material'

import { createTransaction, executeTransaction } from '@/services/createTransaction'
import extractTxInfo from '@/services/extractTxInfo'
import useSafeAddress from '@/services/useSafeAddress'
import css from './styles.module.css'
import { CodedException, Errors } from '@/services/exceptions'
import { AppDispatch, useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import { removePendingTx, setPendingTx } from '@/store/pendingTxsSlice'
import { useChainId } from '@/services/useChainId'

export const executeTx = (chainId: string, txSummary: TransactionSummary, safeAddress: string) => {
  return async (dispatch: AppDispatch) => {
    const txId = txSummary.id

    dispatch(setPendingTx({ txId }))
    try {
      const txDetails = await getTransactionDetails(chainId, txId)
      const { txParams, signatures } = extractTxInfo(txSummary, txDetails, safeAddress)

      const safeTx = await createTransaction(txParams)
      Object.entries(signatures).forEach(([signer, data]) => {
        safeTx.addSignature({ signer, data, staticPart: () => data, dynamicPart: () => '' })
      })
      await executeTransaction(safeTx)
    } catch (err) {
      const { message } = new CodedException(Errors._804, (err as Error).message)

      dispatch(showNotification({ message }))
      dispatch(removePendingTx({ txId }))
    }
  }
}

const ExecuteProposedTx = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const address = useSafeAddress()
  const chainId = useChainId()
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
