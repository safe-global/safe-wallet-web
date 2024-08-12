import ImageFallback from '@/components/common/ImageFallback'
import { type ReactElement, memo } from 'react'

const APP_LOGO_FALLBACK_IMAGE = `/images/apps/app-placeholder.svg`
const ALLOWED_HOSTS = ['.safe.global', '.5afe.dev']

export const _isSafeSrc = (src: string) => {
  const isRelative = src.startsWith('/')

  let hostname = ''
  if (!isRelative) {
    try {
      hostname = new URL(src).hostname
    } catch (e) {
      return false
    }
  }

  return isRelative || ALLOWED_HOSTS.some((host) => hostname.endsWith(host))
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
      src={_isSafeSrc(src) ? src : fallback}
      alt={alt}
      width={width}
      height={height}
      fallbackSrc={fallback}
    />
  )
}

export default memo(SafeAppIconCard)
