import { Box } from '@mui/material'
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
  const { isExecutable } = useRecoveryTxState(item)
  const { isMalicious } = item

  return (
    <Box className={css.gridContainer}>
      <Box gridArea="type">
        <RecoveryType isMalicious={isMalicious} />
      </Box>

      <Box gridArea="info">
        <RecoveryInfo isMalicious={isMalicious} />
      </Box>

      {!isExecutable ? (
        <Box gridArea="status">
          <RecoveryStatus recovery={item} />
        </Box>
      ) : (
        !isMalicious &&
        wallet && (
          <Box gridArea="status" display="flex" alignItems="center" gap={2} mr={2}>
            <ExecuteRecoveryButton recovery={item} compact />
            <CancelRecoveryButton recovery={item} compact />
          </Box>
        )
      )}
    </Box>
  )
}
