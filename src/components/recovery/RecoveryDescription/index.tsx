import { Typography } from '@mui/material'
import type { ReactElement } from 'react'

import EthHashInfo from '@/components/common/EthHashInfo'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { useIsRecoverer } from '@/hooks/useIsRecoverer'
import { useRecoveredSafeInfo } from '@/hooks/useRecoveredSafeInfo'
import type { RecoveryQueueItem } from '@/services/recovery/recovery-state'

export function RecoveryDescription({ item }: { item: RecoveryQueueItem }): ReactElement {
  const { isMalicious } = item

  if (isMalicious) {
    return (
      <ErrorMessage>This transaction potentially calls malicious actions. We recommend cancelling it.</ErrorMessage>
    )
  }

  return <_RecoveryDescription item={item} />
}

// Conditional hooks
function _RecoveryDescription({ item }: { item: RecoveryQueueItem }): ReactElement {
  const isRecoverer = useIsRecoverer()
  const [newSetup, newSetupError] = useRecoveredSafeInfo(item)

  if (!newSetup) {
    return (
      <ErrorMessage level="warning" error={newSetupError}>
        It is not possible to decode the proposed Account setup as the owner structure has changed since proposal. We{' '}
        <b>highly recommend</b> cancelling it
        {isRecoverer ? ' and trying again' : ''}.
      </ErrorMessage>
    )
  }

  return (
    <InfoDetails title="Add owner(s):">
      {newSetup.owners.map((owner) => (
        <EthHashInfo key={owner.value} address={owner.value} shortAddress={false} showCopyButton hasExplorer />
      ))}

      <div>
        <Typography fontWeight={700} gutterBottom>
          Required confirmations for new transactions:
        </Typography>
        <Typography>
          {newSetup.threshold} out of {newSetup.owners.length} owner(s)
        </Typography>
      </div>
    </InfoDetails>
  )
}
