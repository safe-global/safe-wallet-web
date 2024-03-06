import { ChevronRight } from '@mui/icons-material'
import { Box } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { ReactElement } from 'react'
import { useMemo } from 'react'

import { AppRoutes } from '@/config/routes'
import { RecoveryInfo } from '@/features/recovery/components/RecoveryInfo'
import { RecoveryStatus } from '@/features/recovery/components/RecoveryStatus'
import { RecoveryType } from '@/features/recovery/components/RecoveryType'
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
      <Box data-sid="35825" className={css.container} minHeight={50}>
        <Box data-sid="82731" flex={1}>
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
