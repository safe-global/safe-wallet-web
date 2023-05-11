import { type ReactElement, memo } from 'react'

const APP_LOGO_FALLBACK_IMAGE = `/images/apps/app-placeholder.svg`

const getIframeContent = (url: string, width: number, height: number, fallback: string): string => {
  return `
     <body style="margin: 0; overflow: hidden;">
       <img src="${encodeURI(url)}" alt="Safe App logo" width="${width}" height="${height}" />
       <script>
          document.querySelector('img').onerror = (e) => {
           e.target.onerror = null
           e.target.src = "${fallback}"
         }
       </script>
     </body>
  `
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
    <iframe
      title={alt}
      srcDoc={getIframeContent(src, width, height, fallback)}
      sandbox="allow-scripts"
      referrerPolicy="strict-origin"
      width={width}
      height={height}
      style={{ pointerEvents: 'none', border: 0 }}
      tabIndex={-1}
      loading="lazy"
    />
  )
}

export default memo(SafeAppIconCard)
