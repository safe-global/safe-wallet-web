import Onboard, { type EIP1193Provider, type OnboardAPI } from '@web3-onboard/core'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { hexValue } from '@ethersproject/bytes'
import { getAllWallets } from '@/hooks/wallets/wallets'
import { getRpcServiceUrl } from '@/hooks/wallets/web3'
import type { EnvState } from '@/store/settingsSlice'

export type ConnectedWallet = {
  label: string
  chainId: string
  address: string
  ens?: string
  provider: EIP1193Provider
}

export const createOnboard = (chainInfo: ChainInfo, rpcConfig: EnvState['rpc'] | undefined): OnboardAPI => {
  const wallets = getAllWallets(chainInfo)

  const chains = [
    {
      id: hexValue(parseInt(chainInfo.chainId)),
      label: chainInfo.chainName,
      rpcUrl: rpcConfig?.[chainInfo.chainId] || getRpcServiceUrl(chainInfo.rpcUri),
      token: chainInfo.nativeCurrency.symbol,
      color: chainInfo.theme.backgroundColor,
      publicRpcUrl: chainInfo.publicRpcUri.value,
      blockExplorerUrl: new URL(chainInfo.blockExplorerUriTemplate.address).origin,
    },
  ]

  const onboard = Onboard({
    wallets,

    chains,

    accountCenter: {
      mobile: { enabled: false },
      desktop: { enabled: false },
    },

    notify: {
      enabled: false,
    },

    appMetadata: {
      name: 'Safe{Wallet}',
      // Both heights need be set to correctly size the image in the connecting screen/modal
      icon: '<svg height="100%"><image href="/images/safe-logo-green.png" height="100%" /></svg>',
      description: 'Please select a wallet to connect to Safe{Wallet}',
    },

    connect: {
      removeWhereIsMyWalletWarning: true,
      autoConnectLastWallet: true,
    },
  })

  return onboard
}