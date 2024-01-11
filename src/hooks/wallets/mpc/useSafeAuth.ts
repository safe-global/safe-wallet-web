import useOnboard, { connectWallet, getConnectedWallet } from '@/hooks/wallets/useOnboard'
import ExternalStore from '@/services/ExternalStore'
import { onboardListeners, ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/SocialLoginModule'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { type OnboardAPI } from '@web3-onboard/core'
import { getRpcServiceUrl } from '../web3'
import { type SafeAuthPack, type SafeAuthInitOptions } from '@safe-global/auth-kit'
import useAsync from '@/hooks/useAsync'
import { useEffect } from 'react'
import { useCurrentChain } from '@/hooks/useChains'

const { getStore, setStore, useStore } = new ExternalStore<SafeAuthPack>()

export const initSafeAuth = async (chain: ChainInfo, onboard: OnboardAPI) => {
  const chainConfig = {
    chainId: `0x${Number(chain.chainId).toString(16)}`,
    rpcTarget: getRpcServiceUrl(chain.rpcUri),
  }

  const { SafeAuthPack } = await import('@safe-global/auth-kit')
  const safeAuthInitOptions: SafeAuthInitOptions = {
    //buildEnv: IS_PRODUCTION ? 'production' : 'testing',
    buildEnv: 'production',
    chainConfig,
    enableLogging: true,
  }

  const oldPack = _getSafeAuthPackInstance()

  if (oldPack) {
    oldPack.destroy()
  }

  const safeAuthPack = new SafeAuthPack({
    txServiceUrl: chain.transactionService,
  })

  return safeAuthPack
    .init(safeAuthInitOptions)
    .then(() => {
      setStore(safeAuthPack)

      safeAuthPack.subscribe('accountsChanged', (...args) => {
        connectWallet(onboard, {
          autoSelect: {
            label: ONBOARD_MPC_MODULE_LABEL,
            disableModals: true,
          },
        }).catch((reason) => console.error('Error connecting to MPC module:', reason))
      })

      // Always keep the onboard listeners
      Object.entries(onboardListeners).forEach((eventListeners) => {
        eventListeners[1].forEach((listener) => {
          safeAuthPack.subscribe(eventListeners[0] as 'accountsChanged' | 'chainChanged', listener)
        })
      })

      if (!safeAuthPack.isAuthenticated) {
        return
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
        const newProvider = safeAuthPack.getProvider()
        if (!newProvider) {
          return
        }

        return safeAuthPack
      }
    })
    .catch((error) => console.error(error))
}

export const _getSafeAuthPackInstance = getStore

export const setSafeAuthPack = setStore

export const useSafeAuthUserInfo = () => {
  const safeAuthPack = useStore()
  return useAsync(() => {
    if (!safeAuthPack) {
      return
    }
    return safeAuthPack.getUserInfo()
  }, [safeAuthPack])
}

export const useInitSafeAuth = () => {
  const chain = useCurrentChain()
  const onboard = useOnboard()
  const safeAuthPack = useStore()
  useEffect(() => {
    if (!chain || !onboard) {
      return
    }
    initSafeAuth(chain, onboard)
  }, [chain, onboard, safeAuthPack?.destroy])
}

export default useStore
