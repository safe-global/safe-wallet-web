import { Typography } from '@mui/material'
import { useContext, useEffect } from 'react'
import type { ReactElement } from 'react'

import { SafeTxContext } from '../../SafeTxProvider'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getRecoverySkipTransaction } from '@/services/recovery/transaction'
import { createTx } from '@/services/tx/tx-sender'
import ErrorMessage from '@/components/tx/ErrorMessage'
import type { RecoveryQueueItem } from '@/components/recovery/RecoveryLoaderContext'

export function CancelRecoveryFlowReview({ recovery }: { recovery: RecoveryQueueItem }): ReactElement {
  const web3ReadOnly = useWeb3ReadOnly()
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)

  useEffect(() => {
    if (!web3ReadOnly) {
      return
    }
    const transaction = getRecoverySkipTransaction(recovery, web3ReadOnly)
    createTx(transaction).then(setSafeTx).catch(setSafeTxError)
  }, [setSafeTx, setSafeTxError, recovery, web3ReadOnly])

  return (
    <SignOrExecuteForm onSubmit={() => null} isBatchable={false}>
      <Typography mb={1}>
        This transaction will initiate the cancellation of the{' '}
        {recovery.isMalicious ? 'malicious transaction' : 'recovery attempt'}. It requires other owner signatures in
        order to be complete.
      </Typography>

      <ErrorMessage level="info">
        All actions initiated by the guardian will be skipped. The current owners will remain the owners of the Safe
        Account.
      </ErrorMessage>
    </SignOrExecuteForm>
  )
}
