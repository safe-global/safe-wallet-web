import { type ReactElement } from 'react'
import ImageFallback from '../ImageFallback'
import css from './styles.module.css'

const TokenIcon = ({
  logoUri,
  tokenSymbol,
  size = 26,
  fallbackSrc,
}: {
  logoUri?: string
  tokenSymbol?: string
  size?: number
  fallbackSrc?: string
}): ReactElement | null => {
  let FALLBACK_ICON = '/images/common/token-placeholder.svg'
  if (tokenSymbol) {
    if (['CELO', 'cUSD', 'cEUR', 'cREAL'].includes(tokenSymbol)) {
      FALLBACK_ICON = `https://reserve.mento.org/assets/tokens/${tokenSymbol}.svg`
    } else {
      FALLBACK_ICON = `https://raw.githubusercontent.com/ubeswap/default-token-list/master/assets/asset_${tokenSymbol}.png`
    }
  }

  return (
    <ImageFallback
      src={logoUri}
      alt={tokenSymbol}
      fallbackSrc={fallbackSrc || FALLBACK_ICON}
      height={size}
      className={css.image}
    />
  )
}

export default TokenIcon
