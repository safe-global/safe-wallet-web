import { getWeb3ReadOnly } from '@/hooks/wallets/web3'
import { FEATURES, hasFeature } from '@/utils/chains'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { type WalletInit, ProviderRpcError } from '@web3-onboard/common'
import { type EIP1193Provider } from '@web3-onboard/core'
import { _getSafeAuthPackInstance } from '@/features/socialwallet/hooks/useSafeAuth'

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
function MpcModule(chain: ChainInfo): WalletInit {
  if (!hasFeature(chain, FEATURES.SOCIAL_LOGIN)) return () => null

  return () => {
    return {
      label: ONBOARD_MPC_MODULE_LABEL,
      getIcon: async () => (await import('./icon')).default,
      getInterface: async () => {
        const { _getSafeAuthPackInstance: _getMPCCoreKitInstance } = await import(
          '@/features/socialwallet/hooks/useSafeAuth'
        )
        const getMPCProvider = () => _getSafeAuthPackInstance()?.getProvider()

        const provider: EIP1193Provider = {
          on: (event, listener) => {
            const safeAuthPack = _getSafeAuthPackInstance()
            if (event === 'accountsChanged' || event === 'chainChanged') {
              safeAuthPack?.subscribe(event, listener)
            }
          },
          request: (request) => {
            return new Promise<any>(async (resolve, reject) => {
              try {
                /*
                 * We have to fallback to web3ReadOnly for eth_estimateGas because the provider by Web3Auth does not expose / implement it.
                 */
                if ('eth_estimateGas' === request.method) {
                  const web3ReadOnly = assertDefined(getWeb3ReadOnly())

                  web3ReadOnly
                    ?.send(request.method, request.params ?? [])
                    .then(resolve)
                    .catch(reject)

                  return
                }

                if ('eth_requestAccounts' === request.method) {
                  try {
                    // If the provider is defined we already have access to the accounts.
                    const isLoggedIn = _getSafeAuthPackInstance()?.isAuthenticated
                    if (!isLoggedIn) {
                      throw new Error('Not signed in')
                    }

                    const web3 = assertDefined(getMPCProvider())
                    web3.request({ method: 'eth_accounts' }).then(resolve).catch(reject)
                  } catch (e) {
                    // Otherwise try to log in the user
                    const safeAuthPack = _getSafeAuthPackInstance()
                    if (!safeAuthPack) {
                      throw Error('Social Login not ready')
                    }

                    const signInResponse = await safeAuthPack.signIn()
                    resolve([signInResponse.eoa])
                  }
                  return
                }

                const web3 = assertDefined(getMPCProvider())
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
            // Not implemented
          },
          disconnect: () => {
            _getSafeAuthPackInstance()?.signOut()
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
