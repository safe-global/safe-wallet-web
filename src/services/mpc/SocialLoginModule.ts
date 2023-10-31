import { _getMPCCoreKitInstance } from '@/hooks/wallets/mpc/useMPC'
import { getWeb3ReadOnly } from '@/hooks/wallets/web3'
import { type WalletInit, ProviderRpcError } from '@web3-onboard/common'
import { type EIP1193Provider } from '@web3-onboard/core'

const getMPCProvider = () => _getMPCCoreKitInstance()?.provider

const assertDefined = <T>(mpcProvider: T | undefined) => {
  if (!mpcProvider) {
    throw new Error('MPC provider is not ready. Login and initialize it first')
  }
  return mpcProvider
}

export const ONBOARD_MPC_MODULE_LABEL = 'Social Login'

export const isSocialLoginWallet = (walletLabel: string | undefined) => {
  return walletLabel === ONBOARD_MPC_MODULE_LABEL
}

/**
 * Module for MPC wallet created by the Web3Auth tKey MPC.
 * We gain access to the provider created by tKey MPC after a successful login.
 * This module returns a provider which will always get the current MPC Wallet provider from an ExternalStore and delegate all calls to it.
 *
 * @returns Custom Onboard MpcModule
 */
function MpcModule(): WalletInit {
  return () => {
    return {
      label: ONBOARD_MPC_MODULE_LABEL,
      getIcon: async () => (await import('./icon')).default,
      getInterface: async () => {
        const provider: EIP1193Provider = {
          on: (event, listener) => {
            const web3 = assertDefined(getMPCProvider())
            web3.on(event, listener)
          },
          request: (request) => {
            return new Promise<any>((resolve, reject) => {
              try {
                const web3 = assertDefined(getMPCProvider())
                const web3ReadOnly = assertDefined(getWeb3ReadOnly())
                /*
                 * We have to fallback to web3ReadOnly for eth_estimateGas because the provider by Web3Auth does not expose / implement it.
                 */
                if ('eth_estimateGas' === request.method) {
                  web3ReadOnly
                    ?.send(request.method, request.params ?? [])
                    .then(resolve)
                    .catch(reject)
                  return
                }

                /*
                 * If the provider is defined we already have access to the accounts. So we can just reply with the current account.
                 */
                if ('eth_requestAccounts' === request.method) {
                  web3.request({ method: 'eth_accounts' }).then(resolve).catch(reject)
                  return
                }

                if ('wallet_switchEthereumChain' === request.method) {
                  // The MPC provider always uses the current chain as chain. Nothing to do here.
                  resolve(null)
                  return
                }

                // Default: we call the inner provider
                web3.request(request).then(resolve).catch(reject)
                return
              } catch (error) {
                reject(
                  new ProviderRpcError({
                    // TODO: This error code is usually for user rejection. But 4009 for instance has no effect with onboard
                    code: 4001,
                    message: 'Provider is unavailable',
                  }),
                )
              }
            })
          },
          removeListener: (event, listener) => {
            const web3 = assertDefined(getMPCProvider())
            return web3.removeListener(event, listener)
          },
          disconnect: () => {
            _getMPCCoreKitInstance()?.logout()
          },
        }

        return {
          provider,
        }
      },
    }
  }
}

export default MpcModule
