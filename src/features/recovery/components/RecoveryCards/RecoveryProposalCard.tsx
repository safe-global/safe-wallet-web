import Track from '@/components/common/Track'
import { trackEvent } from '@/services/analytics'
import { RECOVERY_EVENTS } from '@/services/analytics/events/recovery'
import { Button, Card, Divider, Grid, Typography } from '@mui/material'
import { useContext } from 'react'
import type { ReactElement } from 'react'

import { useDarkMode } from '@/hooks/useDarkMode'
import ExternalLink from '@/components/common/ExternalLink'
import { RecoverAccountFlow } from '@/components/tx-flow/flows'
import useSafeInfo from '@/hooks/useSafeInfo'
import madProps from '@/utils/mad-props'
import { TxModalContext } from '@/components/tx-flow'
import { HelpCenterArticle, HelperCenterArticleTitles } from '@/config/constants'
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

export function _RecoveryProposalCard({ orientation = 'vertical', onClose, safe, setTxFlow }: Props): ReactElement {
  const isDarkMode = useDarkMode()

  const onRecover = async () => {
    onClose?.()
    setTxFlow(<RecoverAccountFlow />)
    trackEvent({ ...RECOVERY_EVENTS.START_RECOVERY, label: orientation === 'vertical' ? 'pop-up' : 'dashboard' })
  }

  const icon = (
    <img
      src={`/images/common/propose-recovery-${isDarkMode ? 'dark' : 'light'}.svg`}
      alt="An arrow surrounding a circle containing a vault"
    />
  )
  const title = 'Recover this Account'
  const desc = `The connected wallet was chosen as a trusted Recoverer. You can help the owner${
    safe.owners.length > 1 ? 's' : ''
  } regain access by resetting the Account setup.`

  const link = (
    <Track {...RECOVERY_EVENTS.LEARN_MORE} label="proposal-card">
      <ExternalLink href={HelpCenterArticle.RECOVERY} title={HelperCenterArticleTitles.RECOVERY}>
        Learn more
      </ExternalLink>
    </Track>
  )

  const recoveryButton = (
    <Button data-testid="start-recovery-btn" variant="contained" onClick={onRecover} className={css.button}>
      Start recovery
    </Button>
  )

  if (orientation === 'horizontal') {
    return (
      <Card data-testid="recovery-proposal-hr" sx={{ py: 3, px: 4 }}>
        <Grid
          container
          display="flex"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          gap={3}
          flexDirection={{ xs: 'column', md: 'row' }}
        >
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
    <Card data-testid="recovery-proposal" elevation={0} className={css.card}>
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

        <Grid item container justifyContent="flex-end" gap={{ md: 1 }}>
          <Button
            data-testid="postpone-recovery-btn"
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
