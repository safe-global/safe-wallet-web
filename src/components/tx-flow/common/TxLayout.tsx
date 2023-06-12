import type { ReactNode } from 'react'
import { Box, Container, Grid, Paper, Typography, Button } from '@mui/material'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { ProgressBar } from '@/components/common/ProgressBar'
import SafeTxProvider from '../SafeTxProvider'
import TxNonce from './TxNonce'
import TxStatusWidget from './TxStatusWidget'

type TxLayoutProps = {
  title: string
  children: ReactNode
  step?: number
  txSummary?: TransactionSummary
  onBack?: () => void
}

const TxLayout = ({ title, children, step = 0, txSummary, onBack }: TxLayoutProps) => {
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
            <Grid item xs={7} component={Paper}>
              <ProgressBar value={progress} />

              <Box display="flex" justifyContent="flex-end" py={2} px={3}>
                <TxNonce />
              </Box>

              <div>
                {steps[step]}
                {onBack && step > 0 && (
                  <Button variant="contained" onClick={onBack}>
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
