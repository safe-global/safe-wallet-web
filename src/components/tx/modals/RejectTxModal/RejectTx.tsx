import type { ReactElement } from 'react'
import { Typography } from '@mui/material'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'

import { isMultisigExecutionInfo } from '@/utils/transaction-guards'
import useTxSender from '@/hooks/useTxSender'
import useAsync from '@/hooks/useAsync'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'

type RejectTxProps = {
  txSummary: TransactionSummary
  onSubmit: (txId: string) => void
}

const RejectTx = ({ txSummary, onSubmit }: RejectTxProps): ReactElement => {
  const { createRejectTx } = useTxSender()
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined

  const [rejectTx, rejectError] = useAsync<SafeTransaction>(() => {
    if (txNonce != undefined) return createRejectTx(txNonce)
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
