import type { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import type { WalletInit } from '@web3-onboard/common'

import { CYPRESS_MNEMONIC } from '@/config/constants'
import { getRpcServiceUrl } from '@/hooks/wallets/web3'

const WALLET_NAME = 'E2E Wallet'

const e2eWallet = ({ chainId, rpcUri }: ChainInfo): WalletInit => {
  return () => {
    return {
      label: WALLET_NAME,
      getIcon: async () => Promise.resolve('_'),
      getInterface: async () => {
        const { createEIP1193Provider } = await import('@web3-onboard/common')

        const { default: HDWalletProvider } = await import('@truffle/hdwallet-provider')
        const { Web3Provider } = await import('@ethersproject/providers')

        const provider = new HDWalletProvider({
          mnemonic: CYPRESS_MNEMONIC,
          providerOrUrl: getRpcServiceUrl(rpcUri),
        })

        return {
          provider: createEIP1193Provider(new Web3Provider(provider), {
            eth_requestAccounts: async () => provider.getAddresses(),
            eth_chainId: async () => `0x${parseInt(chainId).toString(16)}`,
          }),
        }
      },
      platforms: ['desktop'],
    }
  }
}

export default e2eWallet
