import { Box, CircularProgress } from '@mui/material'
import type { ReactElement } from 'react'

import { RecoveryType } from '../RecoveryType'
import { RecoveryInfo } from '../RecoveryInfo'
import { RecoveryStatus } from '../RecoveryStatus'
import { ExecuteRecoveryButton } from '../ExecuteRecoveryButton'
import { CancelRecoveryButton } from '../CancelRecoveryButton'
import useWallet from '@/hooks/wallets/useWallet'
import type { RecoveryQueueItem } from '@/features/recovery/services/recovery-state'

import css from './styles.module.css'
import { useRecoveryTxState } from '../../hooks/useRecoveryTxState'

export function RecoverySummary({ item }: { item: RecoveryQueueItem }): ReactElement {
  const wallet = useWallet()
  const { isExecutable, isPending } = useRecoveryTxState(item)
  const { isMalicious } = item

  return (
    <Box className={css.gridContainer}>
      <Box gridArea="type">
        <RecoveryType isMalicious={isMalicious} />
      </Box>

      <Box gridArea="info">
        <RecoveryInfo isMalicious={isMalicious} />
      </Box>

      <Box gridArea="status" display="flex" alignItems="center" gap={1} pr={2}>
        {!isExecutable || isPending ? (
          <>
            {isPending && <CircularProgress size={14} color="inherit" />}
            <RecoveryStatus recovery={item} />
          </>
        ) : (
          !isMalicious &&
          wallet && (
            <>
              <ExecuteRecoveryButton recovery={item} compact />
              <CancelRecoveryButton recovery={item} compact />
            </>
          )
        )}
      </Box>
    </Box>
  )
}
