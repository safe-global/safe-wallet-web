import TokenIcon from '@/components/common/TokenIcon'
import useBalances from '@/hooks/useBalances'
import { type RedefineModuleResponse } from '@/services/security/modules/RedefineModule'
import { sameAddress } from '@/utils/addresses'
import { Box, Grid, Paper, Skeleton, Typography } from '@mui/material'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { useContext } from 'react'
import { TransactionSecurityContext } from '../../TransactionSecurityContext'

const BalanceChangeSkeleton = () => {
  return (
    <>
      <Grid item xs={2} display="inline-flex" alignItems="center" gap={1}>
        <Skeleton variant="circular" width={32} height={32} />
        <Typography fontWeight={700} display="inline">
          <Skeleton />
        </Typography>
      </Grid>
      <Grid item xs={10}>
        <Typography>
          <Skeleton />
        </Typography>
      </Grid>
    </>
  )
}
const SingleBalanceChange = ({
  change,
  positive = false,
}: {
  change: NonNullable<RedefineModuleResponse['balanceChange']>['in' | 'out'][number]
  positive?: boolean
}) => {
  const { balances } = useBalances()

  const logoUri = balances.items.find((item) => {
    return change.type === 'NATIVE'
      ? item.tokenInfo.type === TokenType.NATIVE_TOKEN
      : sameAddress(item.tokenInfo.address, change.address)
  })?.tokenInfo.logoUri
  return (
    <>
      <Grid item xs={2} display="inline-flex" alignItems="center" gap={1} textOverflow="ellipsis" overflow="hidden">
        <TokenIcon size={32} logoUri={logoUri} tokenSymbol={change.symbol} />
        <Typography fontWeight={700} display="inline">
          {change.symbol}
        </Typography>
      </Grid>
      <Grid item xs={10}>
        <Typography color={positive ? 'success.main' : 'error.main'}>
          {positive ? '+' : ''}
          {change.amount.normalizedValue}
        </Typography>
      </Grid>
    </>
  )
}

export const BalanceChanges = () => {
  const { balanceChange, isLoading } = useContext(TransactionSecurityContext)
  return (
    <Paper elevation={2} sx={{ padding: 2 }}>
      <Box display="flex" justifyContent="space-between">
        <Typography>Balance change</Typography> <Typography color="text.secondary">Powered by REDEFINE</Typography>
      </Box>
      <Grid container direction="row" alignItems="center">
        {isLoading && !balanceChange ? (
          <BalanceChangeSkeleton />
        ) : balanceChange ? (
          <>
            {balanceChange?.in?.map((change, idx) => (
              <SingleBalanceChange change={change} key={idx} positive />
            ))}
            {balanceChange?.out?.map((change, idx) => (
              <SingleBalanceChange change={change} key={idx} />
            ))}
          </>
        ) : (
          <Typography color="text.secondary">None</Typography>
        )}
      </Grid>
    </Paper>
  )
}
