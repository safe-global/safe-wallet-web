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
      srcDoc={`<style>html,body{padding:0;margin:0;background-color:transparent;}body{background:url('${src}') 0 0/cover no-repeat;}</style>`}
      title={alt}
      sandbox=""
      referrerPolicy="strict-origin"
      frameBorder={0}
      width={width}
      height={height}
    />
  )
}

export default SandboxedIcon
