import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { WalletInit } from '@web3-onboard/common'
import { getRpcServiceUrl } from '@/hooks/wallets/web3'
import pkPopupStore from './pk-popup-store'

export const PRIVATE_KEY_MODULE_LABEL = 'Private Key'

async function getPrivateKey() {
  const savedKey = pkPopupStore.getStore()?.privateKey
  if (savedKey) return savedKey

  pkPopupStore.setStore({
    isOpen: true,
    privateKey: '',
  })

  return new Promise<string>((resolve) => {
    const unsubscribe = pkPopupStore.subscribe(() => {
      unsubscribe()
      resolve(pkPopupStore.getStore()?.privateKey ?? '')
    })
  })
}

const PrivateKeyModule = (rpcUri: ChainInfo['rpcUri']): WalletInit => {
  return () => {
    return {
      label: PRIVATE_KEY_MODULE_LABEL,
      getIcon: async () => (await import('./icon')).default,
      getInterface: async () => {
        const { createEIP1193Provider } = await import('@web3-onboard/common')

        const { default: HDWalletProvider } = await import('@truffle/hdwallet-provider')

        const privateKey = await getPrivateKey()
        if (!privateKey) {
          throw new Error('You rejected the connection')
        }

        const provider = new HDWalletProvider({
          privateKeys: [privateKey],
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

export default PrivateKeyModule
