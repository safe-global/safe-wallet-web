import type { ReactElement } from 'react'
import { Typography } from '@mui/material'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

import { createRejectTx } from '@/services/tx/txSender'
import useAsync from '@/hooks/useAsync'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'

type RejectTxProps = {
  txNonce: number
  onSubmit: (txId: string) => void
}

const RejectTx = ({ txNonce, onSubmit }: RejectTxProps): ReactElement => {
  const [rejectTx, rejectError] = useAsync<SafeTransaction>(() => {
    return createRejectTx(txNonce)
  }, [txNonce])

  return (
    <SignOrExecuteForm safeTx={rejectTx} isRejection onSubmit={onSubmit} error={rejectError}>
      <Typography mb={2}>
        To reject the transaction, a separate rejection transaction will be created to replace the original one.
      </Typography>

      <Typography mb={2}>
        Transaction nonce: <b>{txNonce}</b>
      </Typography>

      <Typography mb={2}>
        You will need to confirm the rejection transaction with your currently connected wallet.
      </Typography>
    </SignOrExecuteForm>
  )
}

export default RejectTx
