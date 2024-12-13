import { getWeb3ReadOnly } from '@/hooks/wallets/web3'
import { FEATURES, hasFeature } from '@/utils/chains'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { type WalletInit, ProviderRpcError } from '@web3-onboard/common'
import { type EIP1193Provider } from '@web3-onboard/core'
import { type Web3AuthMPCCoreKit } from '@web3auth/mpc-core-kit'

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

const getConnectedAccounts = async (provider: typeof Web3AuthMPCCoreKit.prototype.provider | undefined) => {
  try {
    const web3 = assertDefined(provider)
    return web3.request({ method: 'eth_accounts' })
  } catch (e) {
    throw new ProviderRpcError({
      code: 4001,
      message: 'Provider is unavailable',
    })
  }
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
        const { _getMPCCoreKitInstance } = await import('@/hooks/wallets/mpc/useMPC')
        const { getSocialWalletService } = await import('@/hooks/wallets/mpc/useSocialWallet')
        const { COREKIT_STATUS } = await import('@web3auth/mpc-core-kit')
        const { open } = await import('./PasswordRecoveryModal')

        const getMPCProvider = () => _getMPCCoreKitInstance()?.provider

        const provider: EIP1193Provider = {
          on: (event, listener) => {
            const web3 = assertDefined(getMPCProvider())
            web3.on(event, listener)
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
                    const web3 = assertDefined(getMPCProvider())
                    web3.request({ method: 'eth_accounts' }).then(resolve).catch(reject)
                  } catch (e) {
                    // Otherwise try to log in the user
                    const socialWalletService = getSocialWalletService()
                    if (!socialWalletService) throw Error('Social Login not ready')

                    const status = await socialWalletService.loginAndCreate()

                    if (status === COREKIT_STATUS.REQUIRED_SHARE) {
                      open(() => {
                        getConnectedAccounts(getMPCProvider()).then(resolve).catch(reject)
                      })
                    } else {
                      getConnectedAccounts(getMPCProvider()).then(resolve).catch(reject)
                    }
                  }
                  return
                }

                if ('wallet_switchEthereumChain' === request.method) {
                  // The MPC provider always uses the current chain as chain. Nothing to do here.
                  resolve(null)
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
