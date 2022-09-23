import { useEffect } from 'react'
import { Typography } from '@mui/material'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

import useSafeInfo from '@/hooks/useSafeInfo'
import useAsync from '@/hooks/useAsync'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import EthHashInfo from '@/components/common/EthHashInfo'
import { RemoveGuardData } from '@/components/settings/TransactionGuards/RemoveGuard'
import { Errors, logError } from '@/services/exceptions'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import { createRemoveGuardTx } from '@/services/tx/txSender'

export const ReviewRemoveGuard = ({ data, onSubmit }: { data: RemoveGuardData; onSubmit: (txId: string) => void }) => {
  const { safe } = useSafeInfo()

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    return createRemoveGuardTx()
  }, [])

  useEffect(() => {
    if (safeTxError) {
      logError(Errors._807, safeTxError.message)
    }
  }, [safeTxError])

  const onFormSubmit = (txId: string) => {
    trackEvent(SETTINGS_EVENTS.MODULES.REMOVE_GUARD)

    onSubmit(txId)
  }

  return (
    <SignOrExecuteForm safeTx={safeTx} isExecutable={safe.threshold === 1} onSubmit={onFormSubmit} error={safeTxError}>
      <Typography sx={({ palette }) => ({ color: palette.secondary.light })}>Transaction guard</Typography>
      <EthHashInfo address={data.address} showCopyButton hasExplorer shortAddress={false} />
      <Typography my={2}>
        Once the transaction guard has been removed, checks by the transaction guard will not be conducted before or
        after any subsequent transactions.
      </Typography>
    </SignOrExecuteForm>
  )
}
