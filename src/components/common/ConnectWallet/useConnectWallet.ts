import { useCallback } from 'react'
import useOnboard, { connectWallet } from '@/hooks/wallets/useOnboard'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'

const useConnectWallet = () => {
  const onboard = useOnboard()

  return useCallback(() => {
    if (!onboard) {
      return Promise.resolve(undefined)
    }

    trackEvent(OVERVIEW_EVENTS.OPEN_ONBOARD)
    return connectWallet(onboard)
  }, [onboard])
}

export default useConnectWallet
