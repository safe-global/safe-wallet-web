import { trackEvent } from '@/services/analytics'
import { RECOVERY_EVENTS } from '@/services/analytics/events/recovery'
import { Button, Card, Divider, Grid, Typography } from '@mui/material'
import { useRouter } from 'next/dist/client/router'
import type { ReactElement } from 'react'

import { useRecoveryTxState } from '@/hooks/useRecoveryTxState'
import { Countdown } from '@/components/common/Countdown'
import RecoveryPending from '@/public/images/common/recovery-pending.svg'
import ExternalLink from '@/components/common/ExternalLink'
import { AppRoutes } from '@/config/routes'
import { HelpCenterArticle } from '@/config/constants'
import type { RecoveryQueueItem } from '@/services/recovery/recovery-state'

import css from './styles.module.css'

type Props =
  | {
      orientation?: 'vertical'
      onClose: () => void
      recovery: RecoveryQueueItem
    }
  | {
      orientation: 'horizontal'
      onClose?: never
      recovery: RecoveryQueueItem
    }

const onLearnMoreClick = () => {
  trackEvent({ ...RECOVERY_EVENTS.LEARN_MORE, label: 'in-progress-card' })
}

export function RecoveryInProgressCard({ orientation = 'vertical', onClose, recovery }: Props): ReactElement {
  const { isExecutable, remainingSeconds } = useRecoveryTxState(recovery)
  const router = useRouter()

  const onClick = async () => {
    await router.push({
      pathname: AppRoutes.transactions.queue,
      query: router.query,
    })
    onClose?.()
  }

  const icon = <RecoveryPending />
  const title = isExecutable ? 'Account can be recovered' : 'Account recovery in progress'
  const desc = isExecutable
    ? 'The delay period has passed and it is now possible to execute the recovery transaction.'
    : 'The recovery process has started. This Account will be ready to recover in:'

  const link = (
    <ExternalLink
      href={HelpCenterArticle.RECOVERY}
      onClick={onLearnMoreClick}
      title="Learn more about the Account recovery process"
    >
      Learn more
    </ExternalLink>
  )

  if (orientation === 'horizontal') {
    return (
      <Card sx={{ py: 3, px: 4 }}>
        <Grid container display="flex" alignItems="center" gap={3}>
          <Grid item>{icon}</Grid>

          <Grid item xs>
            <Typography variant="h6" fontWeight={700} mb={1}>
              {title}
            </Typography>

            <Typography color="primary.light" mb={1}>
              {desc}
            </Typography>

            <Countdown seconds={remainingSeconds} />
          </Grid>

          <Grid item>{link}</Grid>
        </Grid>
      </Card>
    )
  }

  return (
    <Card elevation={0} className={css.card}>
      <Grid container display="flex" flexDirection="column" gap={4}>
        <Grid item xs={12} display="flex" justifyContent="space-between">
          {icon}

          {link}
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            {title}
          </Typography>

          <Typography mb={2}>{desc}</Typography>

          <Countdown seconds={remainingSeconds} />
        </Grid>

        <Divider flexItem sx={{ mx: -4 }} />

        <Button variant="contained" onClick={onClick} sx={{ alignSelf: 'flex-end' }}>
          Go to queue
        </Button>
      </Grid>
    </Card>
  )
}
