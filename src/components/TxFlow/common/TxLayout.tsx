import { type ReactElement } from 'react'
import { Container, Grid, Paper, Typography } from '@mui/material'
import TxStatusWidget from '@/components/TxFlow/TxStatusWidget'
import { type TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import css from '@/components/TxFlow/TokenTransfer/styles.module.css'

const TxLayout = ({
  title,
  children,
  step = 0,
  txSummary,
}: {
  title: string
  children: ReactElement
  step?: number
  txSummary?: TransactionSummary
}) => {
  return (
    <Container>
      <Grid container className={css.wrapper} alignItems="center" justifyContent="center">
        <Grid item xs={12}>
          <Typography variant="h3" component="div" fontWeight="700" mb={2}>
            {title}
          </Typography>
        </Grid>
        <Grid item container xs={12} gap={3}>
          <Grid item xs={7} component={Paper}>
            {children}
          </Grid>
          <Grid item xs={4}>
            <TxStatusWidget step={step} txSummary={txSummary} />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  )
}

export default TxLayout
