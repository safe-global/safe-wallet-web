import useOnboard, { connectWallet } from '@/hooks/wallets/useOnboard'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import { useMemo } from 'react'

const useConnectWallet = (): (() => void) => {
  const onboard = useOnboard()

  return useMemo(() => {
    if (!onboard) {
      return () => {}
    }

    return () => {
      trackEvent(OVERVIEW_EVENTS.OPEN_ONBOARD)
      connectWallet(onboard)
    }
  }, [onboard])
}

export default useConnectWallet
