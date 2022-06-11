import { ReactElement } from 'react'
import { Typography } from '@mui/material'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'

import { isMultisigExecutionInfo } from '@/components/transactions/utils'
import { createRejectTx } from '@/services/tx/txSender'
import useAsync from '@/services/useAsync'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'

type RejectTxProps = {
  txSummary: TransactionSummary
  onSubmit: (data: null) => void
}

const RejectTx = ({ txSummary, onSubmit }: RejectTxProps): ReactElement => {
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined

  const [rejectTx] = useAsync<SafeTransaction | undefined>(async () => {
    return txNonce ? createRejectTx(txNonce) : undefined
  }, [txNonce])

  return (
    <div>
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

      <SignOrExecuteForm safeTx={rejectTx} txId={txSummary.id} onSubmit={onSubmit} />
    </div>
  )
}

export default RejectTx
