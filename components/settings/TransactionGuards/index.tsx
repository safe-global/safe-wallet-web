import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Paper, Grid, Link, Typography, Box } from '@mui/material'
import { gte } from 'semver'

import css from './styles.module.css'

const NoTransactionGuard = () => {
  return (
    <Typography mt={2} color={(theme) => theme.palette.secondary.light}>
      No transaction guard set
    </Typography>
  )
}

const GuardDisplay = ({ guardAddress, chainId }: { guardAddress: string; chainId: string }) => {
  return (
    <Box className={css.guarddisplay}>
      <EthHashInfo shortAddress={false} address={guardAddress} showCopyButton chainId={chainId} showAvatar={false} />
    </Box>
  )
}

const TransactionGuards = () => {
  const { safe } = useSafeInfo()

  const isVersionWithGuards = safe && gte(safe.version, '1.3.0')

  if (!isVersionWithGuards) {
    return null
  }

  return (
    <Paper sx={{ padding: 4 }} variant="outlined">
      <Grid container direction="row" justifyContent="space-between" gap={2}>
        <Grid item>
          <Typography variant="h4" fontWeight={700}>
            Transaction Guards
          </Typography>
        </Grid>
        <Grid item sm={12} md={8}>
          <Box>
            <Typography>
              Transaction guards impose additional constraints that are checked prior to executing a Safe transaction.
              Transaction guards are potentially risky, so make sure to only use modules from trusted sources. Learn
              more about transaction guards{' '}
              <Link
                href="https://help.gnosis-safe.io/en/articles/5324092-what-is-a-transaction-guard"
                rel="noreferrer noopener"
                target="_blank"
              >
                here
              </Link>
              .
            </Typography>
            {safe.guard ? (
              <GuardDisplay guardAddress={safe.guard.value} chainId={safe.chainId} />
            ) : (
              <NoTransactionGuard />
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default TransactionGuards
