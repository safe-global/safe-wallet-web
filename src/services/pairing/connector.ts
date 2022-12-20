import type WalletConnect from '@walletconnect/client'
import bowser from 'bowser'

import packageJson from '../../../package.json'
import { IS_PRODUCTION } from '@/config/constants'
import ExternalStore from '@/services/ExternalStore'
import PairingIcon from '@/public/images/safe-logo-green.png'

export const PAIRING_MODULE_STORAGE_ID = 'pairingConnector'

export const getClientMeta = () => {
  const host = location.origin

  const APP_META = {
    name: `Safe Web v${packageJson.version}`,
    url: host,
    icons: [`${host}${PairingIcon.src}`],
  }

  if (typeof window === 'undefined') {
    return {
      description: APP_META.name,
      ...APP_META,
    }
  }

  const parsed = bowser.getParser(window.navigator.userAgent)
  const os = parsed.getOS()
  const browser = parsed.getBrowser()

  return {
    description: `${browser.name} ${browser.version} (${os.name});${APP_META.name}`,
    ...APP_META,
  }
}

export const {
  getStore: getPairingConnector,
  setStore: setPairingConnector,
  useStore: usePairingConnector,
} = new ExternalStore<WalletConnect>()

export enum WalletConnectEvents {
  CONNECT = 'connect',
  DISPLAY_URI = 'display_uri',
  DISCONNECT = 'disconnect',
  CALL_REQUEST = 'call_request',
  SESSION_REQUEST = 'session_request',
  SESSION_UPDATE = 'session_update',
  WC_SESSION_REQUEST = 'wc_sessionRequest',
  WC_SESSION_UPDATE = 'wc_sessionUpdate',
}

if (!IS_PRODUCTION) {
  Object.values(WalletConnectEvents).forEach((event) => {
    getPairingConnector()?.on(event, (...args) => console.info('[Pairing]', event, ...args))
  })
}
