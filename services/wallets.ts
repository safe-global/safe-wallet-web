import type { RecommendedInjectedWallets, WalletInit } from '@web3-onboard/common/dist/types.d'
import type { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import { WC_BRIDGE } from '@/config/constants'

const enum WALLET_KEYS {
  INJECTED = 'INJECTED',
  WALLETCONNECT = 'WALLETCONNECT',
}

// Must be object as enums do not allow for computer values
const CGW_NAMES: { [key in WALLET_KEYS]: string } = {
  [WALLET_KEYS.INJECTED]: 'detectedwallet',
  [WALLET_KEYS.WALLETCONNECT]: 'walletConnect',
}

const getWalletModules = async (): Promise<{ [key in WALLET_KEYS]: WalletInit }> => {
  const WALLET_MODULES: { [key in WALLET_KEYS]: WalletInit } = {
    INJECTED: (await import('@web3-onboard/injected-wallets')).default(),
    WALLETCONNECT: (await import('@web3-onboard/walletconnect')).default({ bridge: WC_BRIDGE }),
  }

  return WALLET_MODULES
}

const _getSupportedWalletModules = async (chains: ChainInfo[], chainId: string): Promise<WalletInit[]> => {
  const chain = chains.find((chain) => chain.chainId === chainId)
  const modules = await getWalletModules()

  return Object.entries(modules).reduce<WalletInit[]>((acc, [key, wallet]) => {
    const cgwName = CGW_NAMES?.[key as WALLET_KEYS] ?? ''
    const isWalletDisabled = chain?.disabledWallets.includes(cgwName) ?? false
    if (!isWalletDisabled) {
      acc.push(wallet)
    }
    return acc
  }, [])
}

export const getDefaultWallets = async (): Promise<WalletInit[]> => {
  const modules = await getWalletModules()
  return Object.values(modules).reduce<WalletInit[]>((acc, wallet) => [...acc, wallet], [])
}

export const getRecommendedInjectedWallets = (): RecommendedInjectedWallets[] => {
  return [{ name: 'MetaMask', url: 'https://metamask.io' }]
}
