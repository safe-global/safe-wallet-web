import ExternalStore from '@/services/ExternalStore'
import SocialWalletService from '@/services/mpc/SocialWalletService'
import { useEffect } from 'react'
import useMpc from './useMPC'

const { getStore, setStore, useStore } = new ExternalStore<SocialWalletService>()

export const useInitSocialWallet = () => {
  const mpcCoreKit = useMpc()

  useEffect(() => {
    if (mpcCoreKit) {
      setStore(new SocialWalletService(mpcCoreKit))
    }
  }, [mpcCoreKit])
}

export default useStore
