import { IS_PRODUCTION } from '@/config/constants'
import { connectWallet, getConnectedWallet } from '@/hooks/wallets/useOnboard'
import ExternalStore from '@/services/ExternalStore'
import { SOCIAL_WALLET_OPTIONS } from '@/services/mpc/config'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/SocialLoginModule'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { type OnboardAPI } from '@web3-onboard/core'
import { CHAIN_NAMESPACES } from '@web3auth/base'
import type { Web3AuthMPCCoreKit } from '@web3auth/mpc-core-kit'
import { COREKIT_STATUS } from '@web3auth/mpc-core-kit'
import { getRpcServiceUrl } from '../web3'

const { getStore, setStore, useStore } = new ExternalStore<Web3AuthMPCCoreKit>()

export const initMPC = async (chain: ChainInfo, onboard: OnboardAPI) => {
  const chainConfig = {
    chainId: `0x${Number(chain.chainId).toString(16)}`,
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    rpcTarget: getRpcServiceUrl(chain.rpcUri),
    displayName: chain.chainName,
    blockExplorer: new URL(chain.blockExplorerUriTemplate.address).origin,
    ticker: chain.nativeCurrency.symbol,
    tickerName: chain.nativeCurrency.name,
  }

  const currentInstance = getStore()
  let previousChainChangedListeners: Function[] = []
  if (currentInstance?.provider) {
    // We are already connected. We copy onboards event listener for the chainChanged event to propagate a potentially new chainId
    const oldProvider = currentInstance.provider
    previousChainChangedListeners = oldProvider.listeners('chainChanged')
  }

  const { Web3AuthMPCCoreKit, WEB3AUTH_NETWORK } = await import('@web3auth/mpc-core-kit')

  const web3AuthCoreKit = new Web3AuthMPCCoreKit({
    web3AuthClientId: SOCIAL_WALLET_OPTIONS.web3AuthClientId,
    // Available networks are "sapphire_devnet", "sapphire_mainnet"
    web3AuthNetwork: WEB3AUTH_NETWORK.MAINNET,
    baseUrl: `${window.location.origin}/`,
    uxMode: 'popup',
    enableLogging: !IS_PRODUCTION,
    //@ts-ignore
    chainConfig,
    manualSync: true,
    hashedFactorNonce: 'safe-global-sfa-nonce',
  })

  return web3AuthCoreKit
    .init()
    .then(() => {
      setStore(web3AuthCoreKit)
      // If rehydration was successful, connect to onboard
      if (web3AuthCoreKit.status !== COREKIT_STATUS.LOGGED_IN || !web3AuthCoreKit.provider) {
        return web3AuthCoreKit
      }

      const connectedWallet = getConnectedWallet(onboard.state.get().wallets)
      if (!connectedWallet) {
        connectWallet(onboard, {
          autoSelect: {
            label: ONBOARD_MPC_MODULE_LABEL,
            disableModals: true,
          },
        }).catch((reason) => console.error('Error connecting to MPC module:', reason))
      } else {
        const newProvider = web3AuthCoreKit.provider

        // To propagate the changedChain we disconnect and connect
        if (previousChainChangedListeners.length > 0 && newProvider) {
          previousChainChangedListeners.forEach((previousListener) =>
            newProvider.addListener('chainChanged', (...args: []) => previousListener(...args)),
          )
          newProvider.emit('chainChanged', `0x${Number(chainConfig.chainId).toString(16)}`)
        }
      }

      return web3AuthCoreKit
    })
    .catch((error) => console.error(error))
}

export const _getMPCCoreKitInstance = getStore

export const setMPCCoreKitInstance = setStore

export default useStore
