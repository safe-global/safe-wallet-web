import { ReactElement } from 'react'
import { Typography } from '@mui/material'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'

import { isMultisigExecutionInfo } from '@/components/transactions/utils'
import { createRejectTx } from '@/services/tx/txSender'
import useAsync from '@/services/useAsync'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import ErrorMessage from '@/components/tx/ErrorMessage'

type RejectTxProps = {
  txSummary: TransactionSummary
  onSubmit: (data: null) => void
}

const RejectTx = ({ txSummary, onSubmit }: RejectTxProps): ReactElement => {
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined

  const [rejectTx, rejectError] = useAsync<SafeTransaction | undefined>(async () => {
    return txNonce ? createRejectTx(txNonce) : undefined
  }, [txNonce])

  return (
    <div>
      <Typography variant="h6">Reject Transaction</Typography>

      <Typography sx={{ margin: '20px 0' }}>
        This action will reject this transaction. A separate transaction will be performed to submit the rejection.
      </Typography>

      <Typography sx={{ margin: '20px 0' }}>
        Transaction nonce: <b>{txNonce}</b>
      </Typography>

      <Typography>
        You are about to create a rejection transaction and will have to confirm it with your currently connected
        wallet.
      </Typography>

      <SignOrExecuteForm safeTx={rejectTx} txId={txSummary.id} onSubmit={onSubmit} />

      <ErrorMessage>{rejectError?.message}</ErrorMessage>
    </div>
  )
}

export default RejectTx
