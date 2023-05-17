// TODO: Upgrade onboard/core once https://github.com/blocknative/web3-onboard/issues/1385 is fixed
import Onboard, { type EIP1193Provider, type OnboardAPI } from '@web3-onboard/core'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { hexValue } from '@ethersproject/bytes'
import { getAllWallets, getRecommendedInjectedWallets } from '@/hooks/wallets/wallets'
import { getRpcServiceUrl } from '@/hooks/wallets/web3'
import type { EnvState } from '@/store/settingsSlice'

export type ConnectedWallet = {
  label: string
  chainId: string
  address: string
  ens?: string
  provider: EIP1193Provider
}

let onboard: OnboardAPI | null = null

export const createOnboard = (chainConfigs: ChainInfo[], rpcConfig: EnvState['rpc'] | undefined): OnboardAPI => {
  if (onboard) return onboard

  const wallets = getAllWallets()

  const chains = chainConfigs.map((cfg) => ({
    id: hexValue(parseInt(cfg.chainId)),
    label: cfg.chainName,
    rpcUrl: rpcConfig?.[cfg.chainId] || getRpcServiceUrl(cfg.rpcUri),
    token: cfg.nativeCurrency.symbol,
    color: cfg.theme.backgroundColor,
    publicRpcUrl: cfg.publicRpcUri.value,
    blockExplorerUrl: new URL(cfg.blockExplorerUriTemplate.address).origin,
  }))

  onboard = Onboard({
    wallets,

    chains,

    accountCenter: {
      mobile: { enabled: false },
      desktop: { enabled: false },
    },

    appMetadata: {
      name: 'Safe',
      icon: '/images/safe-logo-green.png',
      description: 'Please select a wallet to connect to Safe',
      recommendedInjectedWallets: getRecommendedInjectedWallets(),
    },
  })

  return onboard
}
