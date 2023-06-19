import type { ComponentType, ReactElement, ReactNode } from 'react'
import { Box, Container, Grid, Typography, Button, Paper, SvgIcon, Divider } from '@mui/material'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { ProgressBar } from '@/components/common/ProgressBar'
import SafeTxProvider from '../../SafeTxProvider'
import TxNonce from '../TxNonce'
import TxStatusWidget from '../TxStatusWidget'
import css from './styles.module.css'

type TxLayoutProps = {
  title: ReactNode
  children: ReactNode
  subtitle?: ReactNode
  icon?: ComponentType
  step?: number
  txSummary?: TransactionSummary
  onBack?: () => void
  hideNonce?: boolean
}

const TxLayout = ({
  title,
  subtitle,
  icon,
  children,
  step = 0,
  txSummary,
  onBack,
  hideNonce = false,
}: TxLayoutProps): ReactElement => {
  const steps = Array.isArray(children) ? children : [children]
  const progress = Math.round(((step + 1) / steps.length) * 100)

  return (
    <SafeTxProvider>
      <Container>
        <Grid container alignItems="center" justifyContent="center">
          <Grid item xs={12}>
            <Typography variant="h3" component="div" fontWeight="700" mb={2}>
              {title}
            </Typography>
          </Grid>

          <Grid item container xs={12} gap={3}>
            <Grid item xs={7}>
              <Paper className={css.header}>
                <ProgressBar value={progress} />

                <Box display="flex" justifyContent="space-between" py={2} px={3}>
                  <Box display="flex" alignItems="center">
                    {icon && (
                      <div className={css.icon}>
                        <SvgIcon component={icon} inheritViewBox />
                      </div>
                    )}

                    {subtitle}
                  </Box>

                  {!hideNonce && <TxNonce />}
                </Box>

                <Divider sx={{ position: 'relative', zIndex: '1' }} />
              </Paper>

              <div className={css.step}>
                {steps[step]}

                {onBack && step > 0 && (
                  <Button variant="contained" onClick={onBack} className={css.backButton}>
                    Back
                  </Button>
                )}
              </div>
            </Grid>

            <Grid item xs={4}>
              <TxStatusWidget step={step} txSummary={txSummary} />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </SafeTxProvider>
  )
}

export default TxLayout
