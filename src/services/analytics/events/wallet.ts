import { GTM_EVENT } from '@/services/analytics/types'

const WALLET_CATEGORY = 'wallet'

export const WALLET_EVENTS = {
  CONNECT: {
    event: GTM_EVENT.META,
    action: 'Connect wallet',
    category: WALLET_CATEGORY,
  },
  WALLET_CONNECT: {
    event: GTM_EVENT.META,
    action: 'WalletConnect peer',
    category: WALLET_CATEGORY,
  },
  OFF_CHAIN_SIGNATURE: {
    event: GTM_EVENT.META,
    action: 'Off-chain signature',
    category: WALLET_CATEGORY,
  },
  ON_CHAIN_INTERACTION: {
    event: GTM_EVENT.META,
    action: 'On-chain interaction',
    category: WALLET_CATEGORY,
  },
}
