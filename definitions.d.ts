import { BeamerConfig, BeamerMethods } from '@services/beamer/types'

declare global {
  interface Window {
    beamer_config?: BeamerConfig
    Beamer?: BeamerMethods
  }
}

export {}
