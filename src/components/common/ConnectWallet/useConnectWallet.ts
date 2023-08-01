import { useMemo } from 'react'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import { usePrivy } from '@privy-io/react-auth'

const useConnectWallet = (): (() => void) => {
  const privy = usePrivy()

  return useMemo(() => {
    return () => {
      trackEvent(OVERVIEW_EVENTS.OPEN_ONBOARD)
      if (!privy.ready) {
        return
      }
      if (!privy.authenticated) {
        privy.login()
      } else {
        privy.connectWallet()
      }
    }
  }, [privy])
}

export default useConnectWallet
