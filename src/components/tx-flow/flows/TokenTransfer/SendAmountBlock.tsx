import { type ReactNode } from 'react'
import { type TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { Grid, Typography } from '@mui/material'
import css from './styles.module.css'
import TokenIcon from '@/components/common/TokenIcon'
import { formatAmountPrecise } from '@/utils/formatNumber'
import { PSEUDO_APPROVAL_VALUES } from '@/components/tx/ApprovalEditor/utils/approvals'

const AmountBlock = ({
  amount,
  tokenInfo,
  children,
}: {
  amount: number | string
  tokenInfo: Omit<TokenInfo, 'name' | 'logoUri'> & { logoUri?: string }
  children?: ReactNode
}) => {
  return (
    <Grid item md={10} className={css.token}>
      <TokenIcon logoUri={tokenInfo.logoUri} tokenSymbol={tokenInfo.symbol} />
      <Typography fontWeight="bold">{tokenInfo.symbol}</Typography>
      {children}
      {amount === PSEUDO_APPROVAL_VALUES.UNLIMITED ? (
        <Typography>{PSEUDO_APPROVAL_VALUES.UNLIMITED}</Typography>
      ) : (
        <Typography>{formatAmountPrecise(amount, tokenInfo.decimals)}</Typography>
      )}
    </Grid>
  )
}

const SendAmountBlock = ({
  amount,
  tokenInfo,
  children,
  title = 'Send',
}: {
  amount: number | string
  tokenInfo: Omit<TokenInfo, 'name' | 'logoUri'> & { logoUri?: string }
  children?: ReactNode
  title?: string
}) => {
  return (
    <Grid container alignItems="center" sx={{ gap: 1 }}>
      <Grid item md>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Grid>
      <AmountBlock amount={amount} tokenInfo={tokenInfo}>
        {children}
      </AmountBlock>
    </Grid>
  )
}

export default SendAmountBlock
