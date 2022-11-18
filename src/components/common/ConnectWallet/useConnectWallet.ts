import useOnboard, { connectWallet } from '@/hooks/wallets/useOnboard'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import { CodedException } from '@/services/exceptions'
import type { ConnectedWallet } from '@/services/onboard'

const useConnectWallet = (onConnect?: (wallet?: ConnectedWallet) => void) => {
  const onboard = useOnboard()

  const handleConnect = async () => {
    if (!onboard) return

    // We `trackEvent` instead of using `<Track>` as it impedes styling
    trackEvent(OVERVIEW_EVENTS.OPEN_ONBOARD)

    const result = await connectWallet(onboard)

    if (result instanceof CodedException) return

    onConnect?.(result)
  }

  return handleConnect
}

export default useConnectWallet
