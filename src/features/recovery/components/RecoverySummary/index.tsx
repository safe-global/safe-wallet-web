import { Box } from '@mui/material'
import type { ReactElement } from 'react'

import DateTime from '@/components/common/DateTime'
import css from '@/components/transactions/TxSummary/styles.module.css'
import { useRecoveryTxState } from '@/features/recovery/hooks/useRecoveryTxState'
import type { RecoveryQueueItem } from '@/features/recovery/services/recovery-state'
import useWallet from '@/hooks/wallets/useWallet'
import { ExecuteRecoveryButton } from '../ExecuteRecoveryButton'
import { RecoveryInfo } from '../RecoveryInfo'
import { RecoveryStatus } from '../RecoveryStatus'
import { RecoveryType } from '../RecoveryType'

export function RecoverySummary({ item }: { item: RecoveryQueueItem }): ReactElement {
  const wallet = useWallet()
  const { isExecutable, isPending } = useRecoveryTxState(item)
  const { isMalicious } = item

  return (
    <Box data-sid="40702" className={css.gridContainer}>
      <Box data-sid="59617" gridArea="type">
        <RecoveryType isMalicious={isMalicious} />
      </Box>

      <Box data-sid="36402" gridArea="info">
        <RecoveryInfo isMalicious={isMalicious} />
      </Box>

      <Box data-sid="14832" gridArea="date" data-testid="tx-date" className={css.date}>
        <DateTime value={Number(item.timestamp)} />
      </Box>

      <Box data-sid="38070" gridArea="status">
        {!isExecutable || isPending ? (
          <RecoveryStatus recovery={item} />
        ) : (
          !isMalicious && wallet && <ExecuteRecoveryButton recovery={item} compact />
        )}
      </Box>
    </Box>
  )
}
