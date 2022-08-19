import { type ReactElement } from 'react'
import { TransferDirection } from '@gnosis.pm/safe-react-gateway-sdk'
import { formatAmount } from '@/utils/formatNumber'
import css from './styles.module.css'
import { formatUnits } from 'ethers/lib/utils'
import ImageFallback from '../ImageFallback'

export const TokenIcon = ({
  logoUri,
  tokenSymbol,
  size = 26,
}: {
  logoUri?: string
  tokenSymbol?: string
  size?: number
}): ReactElement | null => {
  const FALLBACK_ICON = '/images/token-placeholder.svg'

  return !logoUri ? null : (
    <span className={css.iconWrapper}>
      <ImageFallback
        src={logoUri}
        alt={tokenSymbol}
        className={css.tokenIcon}
        fallbackSrc={FALLBACK_ICON}
        height={size}
      />
    </span>
  )
}

const TokenAmount = ({
  value,
  decimals,
  logoUri,
  tokenSymbol,
  direction,
}: {
  value: string
  decimals?: number
  logoUri?: string
  tokenSymbol?: string
  direction?: TransferDirection
}): ReactElement => {
  const sign = direction === TransferDirection.OUTGOING ? '-' : ''
  const amount = decimals ? formatUnits(value, decimals) : value

  return (
    <span className={css.container}>
      {logoUri && <TokenIcon logoUri={logoUri} tokenSymbol={tokenSymbol} />}

      <span>
        {sign}
        {formatAmount(amount)} <span className={css.symbol}>{tokenSymbol}</span>
      </span>
    </span>
  )
}

export default TokenAmount
