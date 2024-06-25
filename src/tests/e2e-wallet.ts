import { type HDNodeWallet, JsonRpcProvider, Wallet } from 'ethers'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { type WalletInit, createEIP1193Provider } from '@web3-onboard/common'
import { getRpcServiceUrl } from '@/hooks/wallets/web3'
import { numberToHex } from '@/utils/hex'
import { CYPRESS_MNEMONIC } from '@/config/constants'

export const E2E_WALLET_NAME = 'E2E Wallet'

let currentChainId = ''
let currentRpcUri = ''

const E2EWalletMoule = (chainId: ChainInfo['chainId'], rpcUri: ChainInfo['rpcUri']): WalletInit => {
  currentChainId = chainId
  currentRpcUri = getRpcServiceUrl(rpcUri)

  return () => {
    return {
      label: E2E_WALLET_NAME,
      getIcon: async () => '<svg />',
      getInterface: async () => {
        let provider: JsonRpcProvider
        let wallet: HDNodeWallet
        const chainChangedListeners = new Set<(chainId: string) => void>()

        const updateProvider = () => {
          provider?.destroy()
          provider = new JsonRpcProvider(currentRpcUri, Number(currentChainId), { staticNetwork: true })
          wallet = Wallet.fromPhrase(CYPRESS_MNEMONIC, provider)

          setTimeout(() => {
            chainChangedListeners.forEach((listener) => listener(numberToHex(Number(currentChainId))))
          }, 100)
        }

        updateProvider()

        return {
          provider: createEIP1193Provider(
            {
              on: (event: string, listener: (...args: any[]) => void) => {
                if (event === 'accountsChanged') {
                  return
                } else if (event === 'chainChanged') {
                  chainChangedListeners.add(listener)
                } else {
                  provider.on(event, listener)
                }
              },

              request: async (request: { method: string; params: any[] }) => {
                return provider.send(request.method, request.params)
              },
            },
            {
              eth_chainId: async () => currentChainId,

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
                const [, json] = params
                const typedData = JSON.parse(json)
                return await wallet.signTypedData(
                  typedData.domain,
                  { [typedData.primaryType]: typedData.types[typedData.primaryType] },
                  typedData.message,
                )
              },

              // @ts-ignore
              wallet_switchEthereumChain: async ({ params }) => {
                updateProvider()
              },
            },
          ),
        }
      },
      platforms: ['desktop'],
    }
  }
}

export default E2EWalletMoule
