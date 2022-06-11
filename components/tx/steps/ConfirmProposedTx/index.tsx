import { ReactElement } from 'react'
import type { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { Typography } from '@mui/material'

import useSafeAddress from '@/services/useSafeAddress'
import { useChainId } from '@/services/useChainId'
import { createExistingTx } from '@/services/tx/txSender'
import useAsync from '@/services/useAsync'
import ErrorToast from '@/components/common/ErrorToast'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'

type ConfirmProposedTxProps = {
  txSummary: TransactionSummary
  onSubmit: (data: null) => void
}

const ConfirmProposedTx = ({ txSummary, onSubmit }: ConfirmProposedTxProps): ReactElement => {
  const safeAddress = useSafeAddress()
  const chainId = useChainId()
  const txId = txSummary.id

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    return createExistingTx(chainId, safeAddress, txSummary)
  }, [txSummary, safeAddress, chainId])

  return (
    <div>
      <Typography variant="h6">Confirm transaction</Typography>

      {safeTx && <SignOrExecuteForm safeTx={safeTx} txId={txId} onSubmit={onSubmit} />}

      {safeTxError ? <ErrorToast message={safeTxError!.message.slice(0, 300)} /> : null}
    </div>
  )
}

export default ConfirmProposedTx
