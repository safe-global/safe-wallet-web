import ImageFallback from '@/components/common/ImageFallback'
import { type ReactElement, memo } from 'react'

const APP_LOGO_FALLBACK_IMAGE = `/images/apps/app-placeholder.svg`

export const _isSafeSrc = (src: string) => {
  const allowedHosts = ['.safe.global', '.5afe.dev']
  const isRelative = src.startsWith('/')

  let hostname = ''
  if (!isRelative) {
    try {
      hostname = new URL(src).hostname
    } catch (e) {
      return false
    }
  }

  return isRelative || allowedHosts.some((host) => hostname.endsWith(host))
}

const SafeAppIconCard = ({
  src,
  alt,
  width = 48,
  height = 48,
  fallback = APP_LOGO_FALLBACK_IMAGE,
}: {
  src: string
  alt: string
  width?: number
  height?: number
  fallback?: string
}): ReactElement => {
  return (
    <ImageFallback
      src={src}
      alt={alt}
      width={width}
      height={height}
      fallbackSrc={fallback}
      crossOrigin={_isSafeSrc(src) ? undefined : 'anonymous'}
    />
  )
}

export default memo(SafeAppIconCard)
