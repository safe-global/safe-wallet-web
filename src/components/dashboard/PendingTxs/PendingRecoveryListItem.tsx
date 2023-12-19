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
import type { RecoveryQueueItem } from '@/services/recovery/recovery-state'

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
      <Box className={css.container} minHeight={50}>
        <Box flex={1}>
          <RecoveryType isMalicious={isMalicious} />
        </Box>

        <RecoveryInfo isMalicious={isMalicious} />

        <RecoveryStatus recovery={transaction} />

        <ChevronRight color="border" />
      </Box>
    </Link>
  )
}
