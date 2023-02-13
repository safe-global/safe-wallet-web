import type { ReactElement } from 'react'
import { useState } from 'react'

type ImageFallbackProps = React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
  fallbackSrc: string
  fallbackComponent?: ReactElement
}

const ImageFallback = ({ src, fallbackSrc, fallbackComponent, ...props }: ImageFallbackProps): React.ReactElement => {
  const [isError, setIsError] = useState<boolean>(false)

  if (isError && fallbackComponent) return fallbackComponent

  return (
    <img
      {...props}
      alt={props.alt}
      src={isError || src === undefined ? fallbackSrc : src}
      onError={() => setIsError(true)}
    />
  )
}

export default ImageFallback
