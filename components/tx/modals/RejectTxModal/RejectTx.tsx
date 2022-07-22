import { ReactElement } from 'react'
import { Typography } from '@mui/material'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'

import { isMultisigExecutionInfo } from '@/utils/transaction-guards'
import { createRejectTx } from '@/services/tx/txSender'
import useAsync from '@/hooks/useAsync'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import useSafeInfo from '@/hooks/useSafeInfo'

type RejectTxProps = {
  txSummary: TransactionSummary
  onSubmit: (data: null) => void
}

const RejectTx = ({ txSummary, onSubmit }: RejectTxProps): ReactElement => {
  const { safe } = useSafeInfo()
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined

  const [rejectTx, rejectError] = useAsync<SafeTransaction | undefined>(async () => {
    return txNonce ? createRejectTx(txNonce) : undefined
  }, [txNonce])

  return (
    <SignOrExecuteForm
      safeTx={rejectTx}
      txId={txSummary.id}
      isExecutable={safe.threshold === 1}
      isRejection
      onSubmit={onSubmit}
      title="Reject transaction"
      error={rejectError}
    >
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
    </SignOrExecuteForm>
  )
}

export default RejectTx
