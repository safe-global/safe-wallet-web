import { memo, type ReactElement } from 'react'
import ImageFallback from '../ImageFallback'
import css from './styles.module.css'

const FALLBACK_ICON = '/images/common/token-placeholder.svg'
const COINGECKO_URL = 'https://assets.coingecko.com/'
const COINGECKO_THUMB = '/thumb/'
const COINGECKO_SMALL = '/small/'

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
}): ReactElement => {
  let crossOrigin = false
  let src = logoUri

  if (logoUri?.startsWith(COINGECKO_URL)) {
    src = logoUri?.replace(COINGECKO_THUMB, COINGECKO_SMALL)
    crossOrigin = true
  }

  return (
    <ImageFallback
      src={src}
      alt={tokenSymbol}
      fallbackSrc={fallbackSrc || FALLBACK_ICON}
      height={size}
      className={css.image}
      loading="lazy"
      referrerPolicy={crossOrigin ? 'no-referrer' : undefined}
      crossOrigin={crossOrigin ? 'anonymous' : undefined}
    />
  )
}

export default memo(TokenIcon)
