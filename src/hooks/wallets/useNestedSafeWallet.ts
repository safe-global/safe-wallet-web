import { type ConnectedWallet } from './useOnboard'
import { type Eip1193Provider, getAddress, type JsonRpcProvider } from 'ethers'
import { SafeWalletProvider, type WalletSDK } from '@/services/safe-wallet-provider'
import { getTransactionDetails, type SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { type NextRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import { initSafeSDK } from '../coreSDK/safeCoreSDK'
import proposeTx from '@/services/tx/proposeTransaction'
import { isSmartContractWallet } from '@/utils/wallets'

export type NestedWallet = {
  address: string
  chainId: string
  provider: Eip1193Provider | null
}

export const getNestedWallet = (
  actualWallet: ConnectedWallet,
  safeInfo: SafeInfo,
  web3ReadOnly: JsonRpcProvider,
  router: NextRouter,
): NestedWallet => {
  const nestedSafeSdk: WalletSDK = {
    getBySafeTxHash(safeTxHash) {
      return getTransactionDetails(safeInfo.chainId, safeTxHash)
    },
    async switchChain() {
      return Promise.reject('Switching chains is not supported yet')
    },
    getCreateCallTransaction() {
      throw new Error('Unsupported method')
    },

    async signMessage(): Promise<{ signature: string }> {
      return Promise.reject('signMessage is not supported yet')
    },

    async proxy(method, params) {
      return web3ReadOnly?.send(method, params ?? [])
    },

    async send(params) {
      const safeCoreSDK = await initSafeSDK({
        provider: web3ReadOnly,
        chainId: safeInfo.chainId,
        address: safeInfo.address.value,
        version: safeInfo.version,
        implementationVersionState: safeInfo.implementationVersionState,
        implementation: safeInfo.implementation.value,
      })

      const connectedSDK = await safeCoreSDK?.connect({ provider: actualWallet.provider })

      if (!connectedSDK) {
        return Promise.reject('Could not initialize core sdk')
      }

      const transactions = params.txs.map(({ to, value, data }: any) => {
        return {
          to: getAddress(to),
          value: BigInt(value).toString(),
          data,
          operation: 0,
        }
      })

      const safeTx = await connectedSDK.createTransaction({
        transactions,
        onlyCalls: true,
      })

      const safeTxHash = await connectedSDK.getTransactionHash(safeTx)

      try {
        if (await isSmartContractWallet(safeInfo.chainId, actualWallet.address)) {
          // With the unchecked signer, the contract call resolves once the tx
          // has been submitted in the wallet not when it has been executed

          // First we propose so the backend will pick it up
          await proposeTx(safeInfo.chainId, safeInfo.address.value, actualWallet.address, safeTx, safeTxHash)
          await connectedSDK.approveTransactionHash(safeTxHash)
        } else {
          // Sign off-chain
          if (safeInfo.threshold === 1) {
            // Directly execute the tx
            await connectedSDK.executeTransaction(safeTx)
          } else {
            const signedTx = await connectedSDK.signTransaction(safeTx)
            await proposeTx(safeInfo.chainId, safeInfo.address.value, actualWallet.address, signedTx, safeTxHash)
          }
        }
      } catch (err) {
        console.error(err)
      }

      return {
        safeTxHash,
      }
    },

    setSafeSettings() {
      throw new Error('setSafeSettings is not supported yet')
    },

    showTxStatus(safeTxHash) {
      router.push({
        pathname: AppRoutes.transactions.tx,
        query: {
          safe: router.query.safe,
          id: safeTxHash,
        },
      })
    },

    async signTypedMessage() {
      return Promise.reject('signTypedMessage is not supported yet')
    },
  }

  const nestedSafeProvider = new SafeWalletProvider(
    {
      chainId: Number(safeInfo.chainId),
      safeAddress: safeInfo.address.value,
    },
    nestedSafeSdk,
  )

  return {
    provider: {
      async request(request) {
        const result = await nestedSafeProvider.request(69420, request, {
          url: '',
          description: '',
          iconUrl: '',
          name: 'Nested Safe',
        })

        if ('result' in result) {
          return result.result
        }
      },
    },
    address: safeInfo.address.value,
    chainId: safeInfo.chainId,
  }
}
