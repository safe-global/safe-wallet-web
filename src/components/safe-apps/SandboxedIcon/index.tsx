import type { ReactElement } from 'react'

const SandboxedIcon = ({
  src,
  alt,
  width = 40,
  height = 40,
}: {
  src: string
  alt: string
  width?: number
  height?: number
}): ReactElement => {
  return (
    <iframe
      src={`/safe-app-icon.html#${encodeURIComponent(src)}`}
      title={alt}
      sandbox="allow-scripts"
      referrerPolicy="strict-origin"
      frameBorder={0}
      width={width}
      height={height}
    />
  )
}

export default SandboxedIcon
