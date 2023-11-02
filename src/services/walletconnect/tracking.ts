import { trackEvent } from '../analytics'
import { WALLETCONNECT_EVENTS } from '../analytics/events/walletconnect'

const trackedRequests = [
  'personal_sign',
  'eth_sign',
  'eth_signTypedData',
  'eth_signTypedData_v4',
  'eth_sendTransaction',
]

export const trackRequest = (peerUrl: string, method: string) => {
  if (trackedRequests.includes(method)) {
    trackEvent({ ...WALLETCONNECT_EVENTS.REQUEST, label: peerUrl })
  }
}
