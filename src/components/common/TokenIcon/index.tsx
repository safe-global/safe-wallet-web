import { type ReactElement } from 'react'
import ImageFallback from '../ImageFallback'
import css from './styles.module.css'

const TokenIcon = ({
  logoUri,
  tokenSymbol,
  size = 26,
}: {
  logoUri?: string
  tokenSymbol?: string
  size?: number
}): ReactElement | null => {
  const FALLBACK_ICON = '/app/images/token-placeholder.svg'

  return !logoUri ? null : (
    <ImageFallback src={logoUri} alt={tokenSymbol} fallbackSrc={FALLBACK_ICON} height={size} className={css.image} />
  )
}

export default TokenIcon
