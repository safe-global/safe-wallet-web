import { SetupRecoveryButton } from '@/features/recovery/components/RecoverySettings'
import { Box, Card, Grid, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import { Chip } from '@/components/common/Chip'
import { WidgetBody, WidgetContainer } from '@/components/dashboard/styled'
import useRecovery from '@/features/recovery/hooks/useRecovery'
import RecoveryLogo from '@/public/images/common/recovery.svg'

import css from './styles.module.css'

function RecoveryWidget(): ReactElement {
  const [recovery] = useRecovery()

  return (
    <WidgetContainer>
      <Typography component="h2" variant="subtitle1" className={css.label}>
        New in {'Safe{Wallet}'}
      </Typography>

      <WidgetBody>
        <Card className={css.card}>
          <Grid container className={css.grid}>
            <Grid item>
              <RecoveryLogo alt="A circular arrow above a lifebuoy" />
            </Grid>

            <Grid item xs>
              <Box data-sid="48257" className={css.wrapper}>
                <Typography variant="h4" className={css.title}>
                  Introducing {`Safe{RecoveryHub}`}{' '}
                </Typography>
                <Chip label="New" />
              </Box>

              <Typography mt={1}>
                Ensure you never lose access to your funds by choosing a recovery option to recover your Safe Account.
              </Typography>

              {(!recovery || recovery.length === 0) && <SetupRecoveryButton eventLabel="dashboard" />}
            </Grid>
          </Grid>
        </Card>
      </WidgetBody>
    </WidgetContainer>
  )
}

export default RecoveryWidget
