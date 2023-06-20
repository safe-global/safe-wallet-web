import { type TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { Grid, Typography } from '@mui/material'
import css from './styles.module.css'
import TokenIcon from '@/components/common/TokenIcon'
import { formatAmountPrecise } from '@/utils/formatNumber'

const SendAmountBlock = ({ amount, tokenInfo }: { amount: number | string; tokenInfo: TokenInfo }) => {
  return (
    <Grid container gap={1}>
      <Grid item xs={2}>
        Send
      </Grid>
      <Grid item className={css.token}>
        <TokenIcon logoUri={tokenInfo.logoUri} tokenSymbol={tokenInfo.symbol} />
        <Typography fontWeight="bold">{tokenInfo.symbol}</Typography>
        <Typography ml={1}>{formatAmountPrecise(amount, tokenInfo.decimals)}</Typography>
      </Grid>
    </Grid>
  )
}

export default SendAmountBlock
