import { trackEvent } from '@/services/analytics'
import { RECOVERY_EVENTS } from '@/services/analytics/events/recovery'
import { Button, Card, Divider, Grid, Typography } from '@mui/material'
import { useContext } from 'react'
import type { ReactElement } from 'react'

import ProposeRecovery from '@/public/images/common/propose-recovery.svg'
import ExternalLink from '@/components/common/ExternalLink'
import { RecoverAccountFlow } from '@/components/tx-flow/flows/RecoverAccount'
import useSafeInfo from '@/hooks/useSafeInfo'
import madProps from '@/utils/mad-props'
import { TxModalContext } from '@/components/tx-flow'
import { HelpCenterArticle } from '@/config/constants'
import type { TxModalContextType } from '@/components/tx-flow'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

import css from './styles.module.css'

type Props =
  | {
      orientation?: 'vertical'
      onClose: () => void
      safe: SafeInfo
      setTxFlow: TxModalContextType['setTxFlow']
    }
  | {
      orientation: 'horizontal'
      onClose?: never
      safe: SafeInfo
      setTxFlow: TxModalContextType['setTxFlow']
    }

const onLearnMoreClick = () => {
  trackEvent({ ...RECOVERY_EVENTS.LEARN_MORE, label: 'proposal-card' })
}

export function _RecoveryProposalCard({ orientation = 'vertical', onClose, safe, setTxFlow }: Props): ReactElement {
  const onRecover = async () => {
    onClose?.()
    setTxFlow(<RecoverAccountFlow />)
    trackEvent({ ...RECOVERY_EVENTS.START_RECOVERY, label: orientation === 'vertical' ? 'pop-up' : 'dashboard' })
  }

  const icon = <ProposeRecovery />
  const title = 'Recover this Account'
  const desc = `The connect wallet was chosen as a trusted Guardian. You can help the owner${
    safe.owners.length > 1 ? 's' : ''
  } regain access by updating the owner list.`

  const link = (
    <ExternalLink
      href={HelpCenterArticle.RECOVERY}
      onClick={onLearnMoreClick}
      title="Learn more about the Account recovery process"
    >
      Learn more
    </ExternalLink>
  )

  const recoveryButton = (
    <Button variant="contained" onClick={onRecover}>
      Start recovery
    </Button>
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

            <Typography>{link}</Typography>
          </Grid>

          {recoveryButton}
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

          <Typography color="primary.light" mb={2}>
            {desc}
          </Typography>
        </Grid>

        <Divider flexItem sx={{ mx: -4 }} />

        <Grid item alignSelf="flex-end">
          <Button
            onClick={() => {
              trackEvent(RECOVERY_EVENTS.DISMISS_PROPOSAL_CARD)
              onClose?.()
            }}
          >
            I&apos;ll do it later
          </Button>
          {recoveryButton}
        </Grid>
      </Grid>
    </Card>
  )
}

// Appease TypeScript
const _useSafe = () => useSafeInfo().safe
const _useSetTxFlow = () => useContext(TxModalContext).setTxFlow

export const RecoveryProposalCard = madProps(_RecoveryProposalCard, {
  safe: _useSafe,
  setTxFlow: _useSetTxFlow,
})
