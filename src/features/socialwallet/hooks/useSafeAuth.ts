import useOnboard, { connectWallet } from '@/hooks/wallets/useOnboard'
import ExternalStore from '@/services/ExternalStore'
import { ONBOARD_MPC_MODULE_LABEL } from '@/features/socialwallet/services/SocialLoginModule'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { type OnboardAPI } from '@web3-onboard/core'
import { getRpcServiceUrl } from '../../../hooks/wallets/web3'
import type { SafeAuthPack, SafeAuthInitOptions, SafeAuthUserInfo } from '@safe-global/auth-kit'
import { useEffect } from 'react'
import { useCurrentChain } from '@/hooks/useChains'

const { getStore, setStore, useStore } = new ExternalStore<SafeAuthPack>()
const {
  getStore: getSafeAuthUserInfo,
  setStore: setSafeAuthUserInfo,
  useStore: useSafeAuthUserInfo,
} = new ExternalStore<SafeAuthUserInfo>()

/**
 * Listener when the accounts change inside the safeAuthPack.
 * Updates the UserInfo state and connects to onboard.
 */
const onAccountsChanged = (safeAuthPack: SafeAuthPack, onboard: OnboardAPI) => (accounts: string[]) => {
  if (accounts.length > 0) {
    safeAuthPack.getUserInfo().then(setSafeAuthUserInfo)
    connectWallet(onboard, {
      autoSelect: {
        label: ONBOARD_MPC_MODULE_LABEL,
        disableModals: true,
      },
    }).catch((reason) => console.error('Error connecting to Social Login module:', reason))
  }
}

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
    return oldPack
  }

  const safeAuthPack = new SafeAuthPack({
    txServiceUrl: chain.transactionService,
  })

  return safeAuthPack
    .init(safeAuthInitOptions)
    .then(() => {
      setStore(safeAuthPack)
      safeAuthPack.subscribe('accountsChanged', onAccountsChanged(safeAuthPack, onboard))
    })
    .catch((error) => console.error(error))
}

export const _getSafeAuthPackInstance = getStore

export const setSafeAuthPack = setStore

export const useInitSafeAuth = () => {
  const chain = useCurrentChain()
  const onboard = useOnboard()
  useEffect(() => {
    if (!chain || !onboard) {
      return
    }
    initSafeAuth(chain, onboard)
  }, [chain, onboard])
}

export default useStore
export const _setSafeAuthUserInfo = setSafeAuthUserInfo
export const _getSafeAuthUserInfo = getSafeAuthUserInfo
export { useSafeAuthUserInfo }
