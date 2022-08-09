import { useState } from 'react'

type ImageFallbackProps = React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
  fallbackSrc: string
}

const ImageFallback = ({ src, fallbackSrc, ...props }: ImageFallbackProps): React.ReactElement => {
  const [url, setUrl] = useState<string>(src || fallbackSrc)

  return <img {...props} alt={props.alt} src={url} onError={() => setUrl(fallbackSrc)} />
}

export default ImageFallback
