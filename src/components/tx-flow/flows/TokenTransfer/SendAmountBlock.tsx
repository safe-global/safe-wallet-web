import { type ReactNode } from 'react'
import { type TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { Grid, Typography } from '@mui/material'
import css from './styles.module.css'
import TokenIcon from '@/components/common/TokenIcon'
import { formatAmountPrecise } from '@/utils/formatNumber'

export const AmountBlock = ({
  amount,
  tokenInfo,
  children,
}: {
  amount: number | string
  tokenInfo: TokenInfo
  children?: ReactNode
}) => {
  return (
    <Grid item className={css.token}>
      <TokenIcon logoUri={tokenInfo.logoUri} tokenSymbol={tokenInfo.symbol} />
      <Typography fontWeight="bold">{tokenInfo.symbol}</Typography>
      {children}
      <Typography ml={1}>{formatAmountPrecise(amount, tokenInfo.decimals)}</Typography>
    </Grid>
  )
}

const SendAmountBlock = ({
  amount,
  tokenInfo,
  children,
}: {
  amount: number | string
  tokenInfo: TokenInfo
  children?: ReactNode
}) => {
  return (
    <Grid container gap={1}>
      <Grid item xs={2}>
        Send
      </Grid>
      <AmountBlock amount={amount} tokenInfo={tokenInfo}>
        {children}
      </AmountBlock>
    </Grid>
  )
}

export default SendAmountBlock
