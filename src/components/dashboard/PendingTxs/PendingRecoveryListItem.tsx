import Link from 'next/link'
import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { ChevronRight } from '@mui/icons-material'
import { Box } from '@mui/material'
import type { ReactElement } from 'react'

import { RecoveryInfo } from '@/components/recovery/RecoveryInfo'
import { RecoveryStatus } from '@/components/recovery/RecoveryStatus'
import { RecoveryType } from '@/components/recovery/RecoveryType'
import { AppRoutes } from '@/config/routes'
import type { RecoveryQueueItem } from '@/store/recoverySlice'

import css from './styles.module.css'

export function PendingRecoveryListItem({ transaction }: { transaction: RecoveryQueueItem }): ReactElement {
  const router = useRouter()
  const { isMalicious } = transaction

  const url = useMemo(
    () => ({
      pathname: AppRoutes.transactions.queue,
      query: router.query,
    }),
    [router.query],
  )

  return (
    <Link href={url} passHref>
      <Box className={css.container}>
        <Box gridArea="nonce" />

        <Box gridArea="type">
          <RecoveryType isMalicious={isMalicious} />
        </Box>

        <Box gridArea="info">
          <RecoveryInfo isMalicious={isMalicious} />
        </Box>

        <Box gridArea="confirmations">
          <RecoveryStatus recovery={transaction} />
        </Box>

        <Box gridArea="action">
          <ChevronRight color="border" />
        </Box>
      </Box>
    </Link>
  )
}
