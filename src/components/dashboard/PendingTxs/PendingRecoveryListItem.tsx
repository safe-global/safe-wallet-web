import Link from 'next/link'
import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { ChevronRight } from '@mui/icons-material'
import { Box } from '@mui/material'
import type { ReactElement } from 'react'

import { RecoveryInfo } from '@/features/recovery/components/RecoveryInfo'
import { RecoveryStatus } from '@/features/recovery/components/RecoveryStatus'
import { RecoveryType } from '@/features/recovery/components/RecoveryType'
import { AppRoutes } from '@/config/routes'
import type { RecoveryQueueItem } from '@/features/recovery/services/recovery-state'

import css from './styles.module.css'

function PendingRecoveryListItem({ transaction }: { transaction: RecoveryQueueItem }): ReactElement {
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
      <Box className={css.container} sx={{ minHeight: 50 }}>
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

export default PendingRecoveryListItem
