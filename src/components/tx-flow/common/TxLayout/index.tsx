import type { ReactNode } from 'react'
import { Box, Container, Grid, Typography, Button, Paper } from '@mui/material'
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
  step?: number
  txSummary?: TransactionSummary
  onBack?: () => void
  hideNonce?: boolean
}

const TxLayout = ({ title, subtitle, children, step = 0, txSummary, onBack, hideNonce = false }: TxLayoutProps) => {
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

                <Box display="flex" justifyContent={subtitle ? 'space-between' : 'flex-end'} py={2} px={3}>
                  {subtitle}
                  {!hideNonce && <TxNonce />}
                </Box>
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
