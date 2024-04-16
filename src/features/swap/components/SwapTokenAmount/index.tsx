import { Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import { type ReactElement } from 'react'
import css from './styles.module.css'
import { formatVisualAmount } from '@/utils/formatters'
import TokenIcon from '@/components/common/TokenIcon'

const SwapTokenAmount = ({
  value,
  label,
  decimals,
  logoUri,
  tokenSymbol,
  fallbackSrc,
}: {
  value: string
  label?: string
  decimals?: number
  logoUri?: string
  tokenSymbol?: string
  fallbackSrc?: string
}): ReactElement => {
  const amount = decimals !== undefined ? formatVisualAmount(value, decimals) : value

  return (
    <div className={css.container}>
      {logoUri && <TokenIcon size={40} logoUri={logoUri} tokenSymbol={tokenSymbol} fallbackSrc={fallbackSrc} />}
      <Stack>
        <Typography variant="body2" color="primary.light">
          {label}
        </Typography>
        <Typography variant="h4" fontWeight="bold">
          {amount} {tokenSymbol}
        </Typography>
      </Stack>
    </div>
  )
}

export default SwapTokenAmount
