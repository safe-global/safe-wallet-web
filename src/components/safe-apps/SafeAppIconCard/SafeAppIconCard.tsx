import { type ReactElement, memo } from 'react'

const getIframeContent = (src: string): string => {
  return `<style>
    html, body {
      padding: 0;
      margin: 0;
      background-color: transparent;
      height: 100%;
    }
    body {
      background: url('${src}') center center/contain no-repeat;
    }
  </style>`
}

const SafeAppIconCard = ({
  src,
  alt,
  width = 48,
  height = 48,
}: {
  src: string
  alt: string
  width?: number
  height?: number
}): ReactElement => {
  return (
    <iframe
      srcDoc={getIframeContent(src)}
      title={alt}
      sandbox=""
      referrerPolicy="strict-origin"
      frameBorder={0}
      width={width}
      height={height}
      style={{ pointerEvents: 'none' }}
      tabIndex={-1}
    />
  )
}

export default memo(SafeAppIconCard)
