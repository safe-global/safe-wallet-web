import { Box } from '@mui/material'
import classNames from 'classnames'
import type { ReactElement } from 'react'

import { RecoveryType } from '../RecoveryType'
import { RecoveryInfo } from '../RecoveryInfo'
import { RecoveryStatus } from '../RecoveryStatus'
import { ExecuteRecoveryButton } from '../ExecuteRecoveryButton'
import { CancelRecoveryButton } from '../CancelRecoveryButton'
import useWallet from '@/hooks/wallets/useWallet'
import type { RecoveryQueueItem } from '@/components/recovery/RecoveryLoaderContext'

import txSummaryCss from '@/components/transactions/TxSummary/styles.module.css'

export function RecoverySummary({ item }: { item: RecoveryQueueItem }): ReactElement {
  const wallet = useWallet()
  const { isMalicious } = item

  return (
    <Box className={classNames(txSummaryCss.gridContainer, txSummaryCss.columnTemplate)}>
      <Box gridArea="type" className={txSummaryCss.columnWrap}>
        <RecoveryType isMalicious={isMalicious} />
      </Box>

      <Box gridArea="info" className={txSummaryCss.columnWrap}>
        <RecoveryInfo isMalicious={isMalicious} />
      </Box>

      {wallet && (
        <Box gridArea="actions" display="flex" justifyContent={{ sm: 'center' }} gap={1}>
          <ExecuteRecoveryButton recovery={item} compact />
          <CancelRecoveryButton recovery={item} compact />
        </Box>
      )}

      <Box gridArea="status" ml={{ sm: 'auto' }} mr={1} display="flex" alignItems="center" gap={1}>
        <RecoveryStatus recovery={item} />
      </Box>
    </Box>
  )
}
