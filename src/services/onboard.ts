import Onboard, { type EIP1193Provider, type OnboardAPI } from '@web3-onboard/core'
import { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { hexValue } from '@ethersproject/bytes'
import { getAllWallets, getRecommendedInjectedWallets } from '@/hooks/wallets/wallets'
import { getRpcServiceUrl } from '@/hooks/wallets/web3'

export type ConnectedWallet = {
  label: string
  chainId: string
  address: string
  ens?: string
  provider: EIP1193Provider
}

let onboard: OnboardAPI | null = null

export const createOnboard = (chainConfigs: ChainInfo[]): OnboardAPI => {
  if (onboard) return onboard

  const wallets = getAllWallets()

  const chains = chainConfigs.map((cfg) => ({
    id: hexValue(parseInt(cfg.chainId)),
    label: cfg.chainName,
    rpcUrl: getRpcServiceUrl(cfg.rpcUri),
    token: cfg.nativeCurrency.symbol,
    color: cfg.theme.backgroundColor,
    // FIXME: add block explorer URL and uncomment publicRpcUrl once Ledger is fixed
    // publicRpcUrl: cfg.publicRpcUri.value,
  }))

  onboard = Onboard({
    wallets,

    chains,

    // TODO: Remove once containerElement is optional again
    accountCenter: {
      mobile: { enabled: false, containerElement: 'body' },
      desktop: { enabled: false, containerElement: 'body' },
    },

    appMetadata: {
      name: 'Safe',
      icon: '/logo-no-text.svg',
      description: 'Please select a wallet to connect to Safe',
      recommendedInjectedWallets: getRecommendedInjectedWallets(),
    },
  })

  return onboard
}
