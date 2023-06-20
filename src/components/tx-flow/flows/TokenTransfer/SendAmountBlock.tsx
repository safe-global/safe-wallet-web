import { type TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { Grid, Skeleton, Typography } from '@mui/material'
import css from './styles.module.css'
import TokenIcon from '@/components/common/TokenIcon'
import { formatAmountPrecise } from '@/utils/formatNumber'

const Loading = () => {
  return (
    <>
      <Skeleton variant="circular" width={26} height={26} />
      <Skeleton variant="rounded" width={30} />
      <Skeleton variant="rounded" width={50} />
    </>
  )
}

const SendAmountBlock = ({ amount, tokenInfo }: { amount: number | string; tokenInfo?: TokenInfo }) => {
  return (
    <Grid container gap={1}>
      <Grid item xs={2}>
        Send
      </Grid>
      <Grid item className={css.token}>
        {tokenInfo ? (
          <>
            <TokenIcon logoUri={tokenInfo.logoUri} tokenSymbol={tokenInfo.symbol} />
            <Typography fontWeight="bold">{tokenInfo.symbol}</Typography>
            <Typography ml={1}>{formatAmountPrecise(amount, tokenInfo.decimals)}</Typography>
          </>
        ) : (
          <Loading />
        )}
      </Grid>
    </Grid>
  )
}

export default SendAmountBlock
