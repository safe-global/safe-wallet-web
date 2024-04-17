import type { ReactElement } from 'react'
import TokenIcon from '@/components/common/TokenIcon'
import { SvgIcon, Typography } from '@mui/material'
import Stack from '@mui/material/Stack'
import css from './styles.module.css'
import EastRoundedIcon from '@mui/icons-material/EastRounded'

const SwapToken = ({
  value,
  tokenSymbol,
  label,
  logoUri,
}: {
  value: string
  tokenSymbol: string
  label?: string
  logoUri?: string
}): ReactElement => {
  return (
    <div className={css.swapToken}>
      <TokenIcon size={40} logoUri={logoUri} tokenSymbol={tokenSymbol} />
      <Stack>
        <Typography variant="body2" color="primary.light">
          {label}
        </Typography>
        <Typography variant="h4" fontWeight="bold">
          {value} {tokenSymbol}
        </Typography>
      </Stack>
    </div>
  )
}

type SwapToken = {
  value: string
  tokenSymbol: string
  label: string
  logoUri: string
}

const SwapTokens = ({ first, second }: { first: SwapToken; second: SwapToken }) => {
  return (
    <div className={css.container}>
      <SwapToken value={first.value} tokenSymbol={first.tokenSymbol} label={first.label} logoUri={first.logoUri} />
      <div className={css.icon}>
        <SvgIcon component={EastRoundedIcon} inheritViewBox fontSize="small" />
      </div>
      <SwapToken value={second.value} tokenSymbol={second.tokenSymbol} label={second.label} logoUri={second.logoUri} />
    </div>
  )
}

export default SwapTokens
