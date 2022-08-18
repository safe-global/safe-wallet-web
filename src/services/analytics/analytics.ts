import { ConnectedWallet } from '../onboard'
import { WALLET_EVENTS } from './events/wallet'

export enum GTM_EVENT {
  PAGEVIEW = 'pageview',
  CLICK = 'customClick',
  META = 'metadata',
  SAFE_APP = 'safeApp',
}

export type EventLabel = string | number | boolean | null

export const trackEvent = ({
  event = GTM_EVENT.CLICK,
  ...rest
}: {
  event?: GTM_EVENT
  category: string
  action: string
  label?: EventLabel
}) => {
  console.log({ event, ...rest })
}

export const trackWalletType = async ({ label, provider }: ConnectedWallet) => {
  const UNKNOWN_PEER = 'Unknown'

  trackEvent({ ...WALLET_EVENTS.CONNECT, label })

  if (label.toUpperCase() !== 'WALLETCONNECT') {
    return
  }

  const { default: WalletConnect } = await import('@walletconnect/client')

  const peerWallet =
    ((provider as unknown as any).connector as InstanceType<typeof WalletConnect>).peerMeta?.name || UNKNOWN_PEER

  trackEvent({
    ...WALLET_EVENTS.WALLET_CONNECT,
    label: peerWallet ?? UNKNOWN_PEER,
  })
}
