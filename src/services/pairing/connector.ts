import WalletConnect from '@walletconnect/client'
import bowser from 'bowser'

import packageJson from '../../../package.json'
import { IS_PRODUCTION, SAFE_REACT_URL, WC_BRIDGE } from '@/config/constants'
import local from '@/services/local-storage/local'
import ExternalStore from '../ExternalStore'

export const PAIRING_MODULE_STORAGE_ID = 'pairingConnector'

const getClientMeta = () => {
  const APP_META = {
    name: `Safe Web v${packageJson.version}`,
    url: SAFE_REACT_URL,
    icons: [`${SAFE_REACT_URL}/images/favicons/logo_120x120.png`],
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

export const createPairingConnector = () => {
  const connector = new WalletConnect({
    bridge: WC_BRIDGE,
    storageId: local.getPrefixedKey(PAIRING_MODULE_STORAGE_ID),
    clientMeta: getClientMeta(),
    // TODO: add `signingMethods` here to match app's signing methods
  })

  if (!IS_PRODUCTION) {
    connector.on(WalletConnectEvents.DISPLAY_URI, (_, { event, params }) => {
      console.log(`[Pairing] ${event} ${params[0]}`)
    })
  }

  return connector
}

export const {
  getStore: getPairingConnector,
  setStore: setPairingConnector,
  useStore: usePairingConnector,
} = new ExternalStore<InstanceType<typeof WalletConnect>>()

export const initializeNewPairingConnector = () => {
  setPairingConnector(createPairingConnector())
}
