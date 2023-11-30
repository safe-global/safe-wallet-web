import { Box, Card, Grid, Typography } from '@mui/material'
import { SetupRecoveryButton } from '@/components/settings/Recovery'
import type { ReactElement } from 'react'

import RecoveryLogo from '@/public/images/common/recovery.svg'
import { WidgetBody, WidgetContainer } from '@/components/dashboard/styled'
import { Chip } from '@/components/common/Chip'
import { useRecovery } from '@/components/recovery/RecoveryContext'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'

import css from './styles.module.css'

export function Recovery(): ReactElement {
  const [recovery] = useRecovery()
  const supportsRecovery = useHasFeature(FEATURES.RECOVERY)

  return (
    <WidgetContainer>
      <Typography component="h2" variant="subtitle1" className={css.label}>
        New in {'Safe{Wallet}'}
      </Typography>

      <WidgetBody>
        <Card className={css.card}>
          <Grid container className={css.grid}>
            <Grid item>
              <RecoveryLogo alt="Vault with a circular arrow around it" />
            </Grid>
            <Grid item xs>
              <Box className={css.wrapper}>
                <Typography variant="h4" className={css.title}>
                  Introducing {`Safe{RecoveryHub}`}{' '}
                </Typography>
                <Chip label="New" />
              </Box>
              <Typography mt={1} mb={3}>
                Ensure you never lose access to your funds by choosing a recovery option to recover your Safe Account.
              </Typography>
              {supportsRecovery && (!recovery || recovery.length === 0) && (
                <SetupRecoveryButton eventLabel="dashboard" />
              )}
            </Grid>
          </Grid>
        </Card>
      </WidgetBody>
    </WidgetContainer>
  )
}
