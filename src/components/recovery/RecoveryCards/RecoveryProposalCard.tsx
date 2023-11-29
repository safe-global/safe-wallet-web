import { Button, Card, Divider, Grid, Typography } from '@mui/material'
import { useContext } from 'react'
import type { ReactElement } from 'react'

import { useDarkMode } from '@/hooks/useDarkMode'
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

export function _RecoveryProposalCard({ orientation = 'vertical', onClose, safe, setTxFlow }: Props): ReactElement {
  const isDarkMode = useDarkMode()

  const onRecover = async () => {
    onClose?.()
    setTxFlow(<RecoverAccountFlow />)
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
  } regain access by updating the owner list.`

  const link = (
    <ExternalLink href={HelpCenterArticle.RECOVERY} title="Learn more about the Account recovery process">
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
          <Button onClick={onClose}>I&apos;ll do it later</Button>
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
