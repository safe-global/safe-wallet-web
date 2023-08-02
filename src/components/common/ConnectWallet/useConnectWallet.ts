import { useMemo } from 'react'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import useWeb3AuthStore, { connectWallet } from '@/hooks/wallets/useWeb3Auth'

const useConnectWallet = (): (() => void) => {
  const web3Auth = useWeb3AuthStore()

  return useMemo(() => {
    return () => {
      trackEvent(OVERVIEW_EVENTS.OPEN_ONBOARD)
      if (!web3Auth) {
        return
      }
      if (!web3Auth.connected) {
        connectWallet(web3Auth)
      }
    }
  }, [web3Auth])
}

export default useConnectWallet
