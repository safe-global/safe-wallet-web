import { useState } from 'react'

type ImageFallbackProps = React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
  fallbackSrc: string
}

const ImageFallback = ({ src, fallbackSrc, ...props }: ImageFallbackProps): React.ReactElement => {
  const [isError, setIsError] = useState<boolean>(false)

  return <img {...props} alt={props.alt} src={isError ? fallbackSrc : src} onError={() => setIsError(true)} />
}

export default ImageFallback
