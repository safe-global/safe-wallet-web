import type { Order } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement } from 'react'
import { Box, Typography } from '@mui/material'
import TokenIcon from '@/components/common/TokenIcon'
import { formatVisualAmount } from '@/utils/formatters'

export const SwapTx = ({ info }: { info: Order }): ReactElement => {
  const { kind, sellToken, sellAmount, buyToken, buyAmount } = info
  const isSellOrder = kind === 'sell'

  let from = (
    <>
      <Box style={{ paddingRight: 5, display: 'inline-block' }}>
        <TokenIcon logoUri={sellToken.logoUri || undefined} tokenSymbol={sellToken.symbol} />
      </Box>
      <Typography component="span" fontWeight="bold">
        {formatVisualAmount(sellAmount, sellToken.decimals)} {sellToken.symbol}{' '}
      </Typography>
    </>
  )

  let to = (
    <>
      <Box style={{ paddingLeft: 5, paddingRight: 5, display: 'inline-block' }}>
        <TokenIcon logoUri={buyToken.logoUri || undefined} tokenSymbol={buyToken.symbol} />
      </Box>{' '}
      <Typography component="span" fontWeight="bold">
        {buyToken.symbol}
      </Typography>
    </>
  )

  if (!isSellOrder) {
    from = (
      <>
        <Box style={{ paddingRight: 5, display: 'inline-block' }}>
          <TokenIcon logoUri={sellToken.logoUri || undefined} tokenSymbol={sellToken.symbol} />
        </Box>
        <Typography component="span" fontWeight="bold">
          {sellToken.symbol}
        </Typography>
      </>
    )
    to = (
      <>
        <Box style={{ paddingLeft: 5, paddingRight: 5, display: 'inline-block' }}>
          <TokenIcon logoUri={buyToken.logoUri || undefined} tokenSymbol={buyToken.symbol} />
        </Box>{' '}
        <Typography component="span" fontWeight="bold">
          {formatVisualAmount(buyAmount, buyToken.decimals)} {buyToken.symbol}{' '}
        </Typography>
      </>
    )
  }

  return (
    <Box display="flex">
      <Typography component="div" display="flex" alignItems="center" fontWeight="bold">
        {from}
        <Typography component="span" ml={0.5}>
          to
        </Typography>
        {to}
      </Typography>
    </Box>
  )
}
