import { JsonRpcProvider, Wallet } from 'ethers'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { type WalletInit, createEIP1193Provider } from '@web3-onboard/common'
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

const PrivateKeyModule = (chainId: ChainInfo['chainId'], rpcUri: ChainInfo['rpcUri']): WalletInit => {
  return () => {
    return {
      label: PRIVATE_KEY_MODULE_LABEL,
      getIcon: async () => (await import('./icon')).default,
      getInterface: async () => {
        const privateKey = await getPrivateKey()
        if (!privateKey) {
          throw new Error('You rejected the connection')
        }

        const provider = new JsonRpcProvider(getRpcServiceUrl(rpcUri))
        const wallet = new Wallet(privateKey, provider)

        return {
          provider: createEIP1193Provider(provider, {
            eth_chainId: async () => chainId,

            // @ts-ignore
            eth_getCode: async ({ params }) => provider.getCode(params[0], params[1]),

            eth_accounts: async () => [wallet.address],
            eth_requestAccounts: async () => [wallet.address],

            eth_call: async ({ params }: { params: any }) => wallet.call(params[0]),

            eth_sendTransaction: async ({ params }) => {
              const tx = await wallet.sendTransaction(params[0] as any)
              return tx.hash // return transaction hash
            },

            personal_sign: async ({ params }) => {
              const signedMessage = wallet.signingKey.sign(params[0])
              return signedMessage.serialized
            },

            eth_signTypedData: async ({ params }) => {
              const signedMessage = await wallet.signTypedData(params[1].domain, params[1].data, params[1].value)
              return signedMessage
            },
          }),
          disconnect: () => {
            pkPopupStore.setStore({ isOpen: false, privateKey: '' })
          },
        }
      },
      platforms: ['desktop'],
    }
  }
}

export default PrivateKeyModule
