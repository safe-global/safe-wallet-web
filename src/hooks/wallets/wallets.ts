import {
  CYPRESS_MNEMONIC,
  FORTMATIC_KEY,
  PORTIS_KEY,
  TREZOR_APP_URL,
  TREZOR_EMAIL,
  WC_BRIDGE,
} from '@/config/constants'
import { type RecommendedInjectedWallets, type WalletInit } from '@web3-onboard/common/dist/types.d'
import type { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import coinbaseModule from '@web3-onboard/coinbase'
import fortmaticModule from '@web3-onboard/fortmatic'
import injectedWalletModule, { ProviderLabel } from '@web3-onboard/injected-wallets'
import keystoneModule from '@web3-onboard/keystone/dist/index'
import ledgerModule from '@web3-onboard/ledger'
import portisModule from '@web3-onboard/portis'
import torusModule from '@web3-onboard/torus'
import trezorModule from '@web3-onboard/trezor'
import walletConnect from '@web3-onboard/walletconnect'

import pairingModule, { PAIRING_MODULE_LABEL } from '@/services/pairing/module'
import e2eWalletModule from '@/tests/e2e-wallet'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { getWeb3ReadOnly } from '@/hooks/wallets/web3'
import { EMPTY_DATA } from '@gnosis.pm/safe-core-sdk/dist/src/utils/constants'
import { InjectedWalletOptions } from '@web3-onboard/injected-wallets/dist/types'

export const enum WALLET_KEYS {
  COINBASE = 'COINBASE',
  FORTMATIC = 'FORTMATIC',
  INJECTED = 'INJECTED',
  KEYSTONE = 'KEYSTONE',
  LEDGER = 'LEDGER',
  PAIRING = 'PAIRING',
  PORTIS = 'PORTIS',
  TORUS = 'TORUS',
  TREZOR = 'TREZOR',
  WALLETCONNECT = 'WALLETCONNECT',
}

// These are only the modules/providers present in the current CGW version

// Note: 'lattice', 'operaTouch', 'walletLink', 'authereum' are also present in CGW
export const CGW_NAMES: { [key in WALLET_KEYS]: string | undefined } = {
  [WALLET_KEYS.COINBASE]: 'coinbase',
  [WALLET_KEYS.FORTMATIC]: 'fortmatic',
  [WALLET_KEYS.INJECTED]: 'detectedwallet',
  [WALLET_KEYS.KEYSTONE]: 'keystone',
  [WALLET_KEYS.LEDGER]: 'ledger',
  [WALLET_KEYS.PAIRING]: 'safeMobile',
  [WALLET_KEYS.PORTIS]: 'portis',
  [WALLET_KEYS.TORUS]: 'torus',
  [WALLET_KEYS.TREZOR]: 'trezor',
  [WALLET_KEYS.WALLETCONNECT]: 'walletConnect',
}

// Note: other `ProviderLabel`s can be injected by @web3-onboard
const INJECTED_CGW_NAMES = {
  [ProviderLabel.Tally]: 'tally',
  [ProviderLabel.Frame]: 'frame',
  [ProviderLabel.Opera]: 'opera',
  [ProviderLabel.Trust]: 'trust',
  [ProviderLabel.MetaMask]: 'metamask',
}

const WALLET_MODULES: { [key in WALLET_KEYS]: (chain?: ChainInfo) => WalletInit } = {
  [WALLET_KEYS.INJECTED]: (chain) => injectedWalletModule({ filter: getInjectWalletFilter(chain) }),
  [WALLET_KEYS.PAIRING]: () => pairingModule(),
  [WALLET_KEYS.WALLETCONNECT]: () => walletConnect({ bridge: WC_BRIDGE }),
  [WALLET_KEYS.LEDGER]: () => ledgerModule(),
  [WALLET_KEYS.TREZOR]: () => trezorModule({ appUrl: TREZOR_APP_URL, email: TREZOR_EMAIL }),
  [WALLET_KEYS.KEYSTONE]: () => keystoneModule(),
  [WALLET_KEYS.COINBASE]: () =>
    coinbaseModule({ darkMode: !!window?.matchMedia('(prefers-color-scheme: dark)')?.matches }),
  [WALLET_KEYS.FORTMATIC]: () => fortmaticModule({ apiKey: FORTMATIC_KEY }),
  [WALLET_KEYS.PORTIS]: () => portisModule({ apiKey: PORTIS_KEY }),
  [WALLET_KEYS.TORUS]: () => torusModule(),
}

export const getAllWallets = (): WalletInit[] => {
  return Object.values(WALLET_MODULES).map((module) => module())
}

export const getRecommendedInjectedWallets = (): RecommendedInjectedWallets[] => {
  return [{ name: ProviderLabel.MetaMask, url: 'https://metamask.io' }]
}

const getInjectWalletFilter = (chain?: ChainInfo): InjectedWalletOptions['filter'] => {
  if (!chain) {
    return undefined
  }

  return Object.entries(INJECTED_CGW_NAMES).reduce<InjectedWalletOptions['filter']>((acc, [label, cgwName]) => {
    if (!chain.disabledWallets.includes(cgwName)) {
      return acc
    } else {
      return { ...(acc || {}), [label]: false }
    }
  }, undefined)
}

export const isWalletSupported = (disabledWallets: string[], walletLabel: string): boolean => {
  const legacyWalletName = CGW_NAMES?.[walletLabel.toUpperCase() as WALLET_KEYS]
  return !disabledWallets.includes(legacyWalletName || walletLabel)
}

export const getSupportedWallets = (chain: ChainInfo): WalletInit[] => {
  if (window.Cypress && CYPRESS_MNEMONIC) {
    return [e2eWalletModule(chain.rpcUri)]
  }
  return Object.entries(WALLET_MODULES)
    .filter(([key]) => isWalletSupported(chain.disabledWallets, key))
    .map(([, module]) => module(chain))
}

export const isHardwareWallet = (wallet: ConnectedWallet): boolean => {
  return [WALLET_KEYS.LEDGER, WALLET_KEYS.TREZOR].includes(wallet.label.toUpperCase() as WALLET_KEYS)
}

export const isWalletConnect = (wallet: ConnectedWallet): boolean => {
  return wallet.label.toUpperCase() === WALLET_KEYS.WALLETCONNECT
}

export const isSafeMobileWallet = (wallet: ConnectedWallet): boolean => {
  return wallet.label === PAIRING_MODULE_LABEL
}

export const isSmartContractWallet = async (wallet: ConnectedWallet) => {
  const provider = getWeb3ReadOnly()

  if (!provider) {
    throw new Error('Provider not found')
  }

  const code = await provider.getCode(wallet.address)

  return code !== EMPTY_DATA
}

export const shouldUseEthSignMethod = (wallet: ConnectedWallet) => {
  return isHardwareWallet(wallet) || isSafeMobileWallet(wallet) || isWalletConnect(wallet)
}
