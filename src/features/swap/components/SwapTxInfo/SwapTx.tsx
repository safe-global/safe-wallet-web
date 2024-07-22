import type { Order } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement } from 'react'
import { Box, Typography } from '@mui/material'
import TokenAmount from '@/components/common/TokenAmount'

export const SwapTx = ({ info }: { info: Order }): ReactElement => {
  const { kind, sellToken, sellAmount, buyToken, buyAmount } = info
  const isSellOrder = kind === 'sell'

  let from = <TokenAmount value={sellAmount} decimals={sellToken.decimals} logoUri={sellToken.logoUri ?? undefined} />
  let to = <TokenAmount value={buyAmount} decimals={buyToken.decimals} logoUri={buyToken.logoUri ?? undefined} />

  if (!isSellOrder) {
    ;[from, to] = [to, from]
  }

  return (
    <Box display="flex">
      <Typography component="div" display="flex" alignItems="center" fontWeight="bold">
        {from}
        <Typography component="span">&nbsp;to&nbsp;</Typography>
        {to}
      </Typography>
    </Box>
  )
}
