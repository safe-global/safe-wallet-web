import TokenIcon from '@/components/common/TokenIcon'
import useBalances from '@/hooks/useBalances'
import { type RedefinedModuleResponse } from '@/services/security/modules/RedefineModule'
import { sameAddress } from '@/utils/addresses'
import { Grid, Typography } from '@mui/material'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'

const SingleBalanceChange = ({
  change,
  positive = false,
}: {
  change: NonNullable<RedefinedModuleResponse['balanceChange']>['in' | 'out'][number]
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

export const BalanceChanges = ({ balanceChange }: { balanceChange: RedefinedModuleResponse['balanceChange'] }) => {
  return (
    <>
      <Typography>Balance change</Typography>
      <Grid container direction="row" alignItems="center">
        {balanceChange?.in?.map((change, idx) => (
          <SingleBalanceChange change={change} key={idx} positive />
        ))}
        {balanceChange?.out?.map((change, idx) => (
          <SingleBalanceChange change={change} key={idx} />
        ))}
      </Grid>
    </>
  )
}
