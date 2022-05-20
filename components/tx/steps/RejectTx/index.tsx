import { ReactElement } from 'react'
import { Button, Typography } from '@mui/material'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'

import { rejectTransaction, signTransaction } from '@/services/createTransaction'
import css from './styles.module.css'
import { isMultisigExecutionInfo } from '@/components/transactions/utils'
import { showNotification } from '@/store/notificationsSlice'
import { useAppDispatch } from '@/store'

const RejectTx = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const dispatch = useAppDispatch()
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined

  const onReject = async () => {
    if (!txNonce) return

    try {
      const rejectTx = await rejectTransaction(txNonce)
      await signTransaction(rejectTx)
    } catch (err) {
      dispatch(showNotification({ message: (err as Error).message }))
    }
  }

  return (
    <div className={css.container}>
      <Typography variant="h6">Reject Transaction</Typography>

      <Typography>
        This action will reject this transaction. A separate transaction will be performed to submit the rejection.
      </Typography>

      <Typography>
        Transaction nonce <br />
        {txNonce}
      </Typography>

      <Typography>
        You are about to create a rejection transaction and will have to confirm it with your currently connected
        wallet.
      </Typography>

      <div className={css.submit}>
        <Button variant="contained" onClick={onReject}>
          Reject transaction
        </Button>
      </div>
    </div>
  )
}

export default RejectTx
