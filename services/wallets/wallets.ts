import { WC_BRIDGE } from '@/config/constants'
import type { RecommendedInjectedWallets, WalletInit } from '@web3-onboard/common/dist/types.d'
import walletInjected from '@web3-onboard/injected-wallets'
import walletConnect from '@web3-onboard/walletconnect'

const enum WALLET_KEYS {
  INJECTED = 'INJECTED',
  WALLETCONNECT = 'WALLETCONNECT',
}

const WALLET_MODULES: { [key in WALLET_KEYS]: () => WalletInit } = {
  [WALLET_KEYS.INJECTED]: walletInjected,
  [WALLET_KEYS.WALLETCONNECT]: () => walletConnect({ bridge: WC_BRIDGE }),
}

const DEFAULT_MODULES = [WALLET_KEYS.INJECTED, WALLET_KEYS.WALLETCONNECT]

export const getDefaultWallets = (): WalletInit[] => {
  return DEFAULT_MODULES.map((key) => WALLET_MODULES[key]())
}

export const getRecommendedInjectedWallets = (): RecommendedInjectedWallets[] => {
  return [{ name: 'MetaMask', url: 'https://metamask.io' }]
}

// Must be object as enums do not allow for computer values
// const CGW_NAMES: { [key in WALLET_KEYS]: string } = {
//   [WALLET_KEYS.INJECTED]: 'detectedwallet',
//   [WALLET_KEYS.WALLETCONNECT]: 'walletConnect',
// }

// const _getSupportedWalletModules = (chains: ChainInfo[], chainId: string): WalletInit[] => {
//   const chain = chains.find((chain) => chain.chainId === chainId)
//   const modules = getWalletModules()

//   return Object.entries(modules).reduce<WalletInit[]>((acc, [key, wallet]) => {
//     const cgwName = CGW_NAMES?.[key as WALLET_KEYS] ?? ''
//     const isWalletDisabled = chain?.disabledWallets.includes(cgwName) ?? false
//     if (!isWalletDisabled) {
//       acc.push(wallet)
//     }
//     return acc
//   }, [])
// }
