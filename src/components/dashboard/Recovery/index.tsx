import { Box, Button, Card, Chip, Grid, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import RecoveryLogo from '@/public/images/common/recovery.svg'
import { WidgetBody, WidgetContainer } from '@/components/dashboard/styled'
import { useDarkMode } from '@/hooks/useDarkMode'

import css from './styles.module.css'

export function Recovery(): ReactElement {
  const isDarkMode = useDarkMode()

  const onClick = () => {
    // TODO: Open enable recovery flow
  }

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
                  Introducing account recovery{' '}
                </Typography>
                <Chip label="New" color={isDarkMode ? 'primary' : 'secondary'} size="small" className={css.chip} />
              </Box>
              <Typography mt={1} mb={3}>
                Ensure that you never lose access to your funds by choosing a guardian to recover your account.
              </Typography>
              <Button variant="contained" onClick={onClick}>
                Set up recovery
              </Button>
            </Grid>
          </Grid>
        </Card>
      </WidgetBody>
    </WidgetContainer>
  )
}
