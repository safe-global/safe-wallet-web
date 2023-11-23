import { Typography } from '@mui/material'
import { useContext, useEffect } from 'react'
import type { ReactElement } from 'react'

import { SafeTxContext } from '../../SafeTxProvider'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getRecoverySkipTransaction } from '@/services/recovery/transaction'
import { createTx } from '@/services/tx/tx-sender'
import type { RecoveryQueueItem } from '@/components/recovery/RecoveryLoaderContext'

export function SkipRecoveryFlowReview({ recovery }: { recovery: RecoveryQueueItem }): ReactElement {
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
      <Typography mb={2}>
        To reject the recovery attempt, a separate transaction will be created to increase the nonce beyond the
        proposal.
      </Typography>

      <Typography mb={2}>
        Queue nonce: <b>{recovery.args.queueNonce.toNumber()}</b>
      </Typography>

      <Typography mb={2}>You will need to confirm the transaction with your currently connected wallet.</Typography>
    </SignOrExecuteForm>
  )
}
