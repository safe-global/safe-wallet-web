import { CYPRESS_MNEMONIC, TREZOR_APP_URL, TREZOR_EMAIL, WC_BRIDGE, WC_PROJECT_ID } from '@/config/constants'
import type { RecommendedInjectedWallets, WalletInit, WalletModule } from '@web3-onboard/common/dist/types.d'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

import coinbaseModule from '@web3-onboard/coinbase'
import injectedWalletModule, { ProviderLabel } from '@web3-onboard/injected-wallets'
import keystoneModule from '@web3-onboard/keystone/dist/index'
import ledgerModule from '@web3-onboard/ledger'
import trezorModule from '@web3-onboard/trezor'
import walletConnect from '@web3-onboard/walletconnect'
import tahoModule from '@web3-onboard/taho'

import pairingModule from '@/services/pairing/module'
import e2eWalletModule from '@/tests/e2e-wallet'
import { CGW_NAMES, WALLET_KEYS } from './consts'

// We need to modify the module name as onboard dedupes modules with the same label and the WC v1 and v2 modules have the same
// @see https://github.com/blocknative/web3-onboard/blob/d399e0b76daf7b363d6a74b100b2c96ccb14536c/packages/core/src/store/actions.ts#L419
// TODO: When removing this, also remove the associated CSS in `onboard.css`
const walletConnectV1 = (): WalletInit => {
  return (helpers) => {
    const MODULE_LABEL = 'WalletConnect v1'

    const walletConnectModule = walletConnect({ version: 1, bridge: WC_BRIDGE })(helpers) as WalletModule

    walletConnectModule.label = MODULE_LABEL

    return walletConnectModule
  }
}

const walletConnectV2 = (chain: ChainInfo): WalletInit => {
  return walletConnect({
    version: 2,
    projectId: WC_PROJECT_ID,
    qrModalOptions: {
      themeVariables: {
        '--w3m-z-index': '1302',
      },
    },
    requiredChains: [parseInt(chain.chainId)],
  })
}

const WALLET_MODULES: { [key in WALLET_KEYS]: (chain: ChainInfo) => WalletInit } = {
  [WALLET_KEYS.INJECTED]: () => injectedWalletModule(),
  [WALLET_KEYS.PAIRING]: () => pairingModule(),
  [WALLET_KEYS.WALLETCONNECT]: () => walletConnectV1(),
  [WALLET_KEYS.WALLETCONNECT_V2]: (chain) => walletConnectV2(chain),
  [WALLET_KEYS.LEDGER]: () => ledgerModule(),
  [WALLET_KEYS.TREZOR]: () => trezorModule({ appUrl: TREZOR_APP_URL, email: TREZOR_EMAIL }),
  [WALLET_KEYS.KEYSTONE]: () => keystoneModule(),
  [WALLET_KEYS.TAHO]: () => tahoModule(),
  [WALLET_KEYS.COINBASE]: () =>
    coinbaseModule({ darkMode: !!window?.matchMedia('(prefers-color-scheme: dark)')?.matches }),
}

export const getAllWallets = (chain: ChainInfo): WalletInit[] => {
  return Object.values(WALLET_MODULES).map((module) => module(chain))
}

export const getRecommendedInjectedWallets = (): RecommendedInjectedWallets[] => {
  return [{ name: ProviderLabel.MetaMask, url: 'https://metamask.io' }]
}

export const isWalletSupported = (disabledWallets: string[], walletLabel: string): boolean => {
  const legacyWalletName = CGW_NAMES?.[walletLabel.toUpperCase() as WALLET_KEYS]
  return !disabledWallets.includes(legacyWalletName || walletLabel)
}

export const getSupportedWallets = (chain: ChainInfo): WalletInit[] => {
  if (window.Cypress && CYPRESS_MNEMONIC) {
    return [e2eWalletModule(chain.rpcUri)]
  }
  const enabledWallets = Object.entries(WALLET_MODULES).filter(([key]) => isWalletSupported(chain.disabledWallets, key))

  if (enabledWallets.length === 0) {
    return [WALLET_MODULES.INJECTED(chain)]
  }

  return enabledWallets.map(([, module]) => module(chain))
}
