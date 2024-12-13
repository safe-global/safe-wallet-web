import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { WalletInit } from '@web3-onboard/common'

import { CYPRESS_MNEMONIC } from '@/config/constants'
import { getRpcServiceUrl } from '@/hooks/wallets/web3'

export const E2E_WALLET_NAME = 'E2E Wallet'

const e2eWalletModule = (rpcUri: ChainInfo['rpcUri']): WalletInit => {
  return () => {
    return {
      label: E2E_WALLET_NAME,
      getIcon: async () => '<svg />',
      getInterface: async () => {
        const { createEIP1193Provider } = await import('@web3-onboard/common')

        const { default: HDWalletProvider } = await import('@truffle/hdwallet-provider')

        const provider = new HDWalletProvider({
          mnemonic: CYPRESS_MNEMONIC,
          providerOrUrl: getRpcServiceUrl(rpcUri),
        })

        return {
          provider: createEIP1193Provider(provider.engine, {
            eth_requestAccounts: async () => provider.getAddresses(),
          }),
        }
      },
      platforms: ['desktop'],
    }
  }
}

export default e2eWalletModule
