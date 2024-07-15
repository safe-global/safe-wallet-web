import { IS_PRODUCTION, TREZOR_APP_URL, TREZOR_EMAIL, WC_PROJECT_ID } from '@/config/constants'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { InitOptions } from '@web3-onboard/core'
import coinbaseModule from '@web3-onboard/coinbase'
import injectedWalletModule from '@web3-onboard/injected-wallets'
import keystoneModule from '@web3-onboard/keystone/dist/index'
import ledgerModule from '@web3-onboard/ledger/dist/index'
import trezorModule from '@web3-onboard/trezor'
import walletConnect from '@web3-onboard/walletconnect'
import safeModule from '@web3-onboard/gnosis'
import pkModule from '@/services/private-key-module'

import { CGW_NAMES, WALLET_KEYS } from './consts'
import { isIframe } from '@/services/safe-apps/utils'

const prefersDarkMode = (): boolean => {
  return window?.matchMedia('(prefers-color-scheme: dark)')?.matches
}

type WalletInits = InitOptions['wallets']
type WalletInit = WalletInits extends Array<infer U> ? U : never

const walletConnectV2 = (chain: ChainInfo) => {
  // WalletConnect v2 requires a project ID
  if (!WC_PROJECT_ID) {
    return () => null
  }

  return walletConnect({
    version: 2,
    projectId: WC_PROJECT_ID,
    qrModalOptions: {
      themeVariables: {
        '--wcm-z-index': '1302',
      },
      themeMode: prefersDarkMode() ? 'dark' : 'light',
    },
    requiredChains: [parseInt(chain.chainId)],
    dappUrl: location.origin,
  })
}

const WALLET_MODULES: Partial<{ [key in WALLET_KEYS]: (chain: ChainInfo) => WalletInit }> = {
  [WALLET_KEYS.INJECTED]: () => injectedWalletModule(),
  [WALLET_KEYS.WALLETCONNECT_V2]: (chain) => walletConnectV2(chain),
  [WALLET_KEYS.COINBASE]: () => coinbaseModule({ darkMode: prefersDarkMode() }),
  [WALLET_KEYS.LEDGER]: () => ledgerModule(),
  [WALLET_KEYS.TREZOR]: () => trezorModule({ appUrl: TREZOR_APP_URL, email: TREZOR_EMAIL }),
  [WALLET_KEYS.KEYSTONE]: () => keystoneModule(),
}

// Testing wallet module
if (!IS_PRODUCTION) {
  WALLET_MODULES[WALLET_KEYS.PK] = (chain) => pkModule(chain.chainId, chain.rpcUri)
}

// Iframe
if (isIframe()) {
  const options = window.location.host === 'localhost:3000' ? { whitelistedDomains: [/localhost:3000/] } : undefined
  WALLET_MODULES[WALLET_KEYS.SAFE] = () => safeModule(options)
}

export const getAllWallets = (chain: ChainInfo): WalletInits => {
  return Object.values(WALLET_MODULES).map((module) => module(chain))
}

export const isWalletSupported = (disabledWallets: string[], walletLabel: string): boolean => {
  const legacyWalletName = CGW_NAMES?.[walletLabel.toUpperCase() as WALLET_KEYS]
  return !disabledWallets.includes(legacyWalletName || walletLabel)
}

export const getSupportedWallets = (chain: ChainInfo): WalletInits => {
  const enabledWallets = Object.entries(WALLET_MODULES).filter(([key]) => isWalletSupported(chain.disabledWallets, key))

  if (enabledWallets.length === 0) {
    return [injectedWalletModule()]
  }

  return enabledWallets.map(([, module]) => module(chain))
}
