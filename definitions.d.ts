import React from 'react'
import { BeamerConfig, BeamerMethods } from '@services/beamer/types'

declare global {
  interface Window {
    beamer_config?: BeamerConfig
    Beamer?: BeamerMethods
  }
}

declare module '*.svg' {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  export default ReactComponent
}

export {}
