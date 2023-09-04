import { EventType } from '@/services/analytics/types'

const WALLET_CATEGORY = 'wallet'

export const WALLET_EVENTS = {
  CONNECT: {
    event: EventType.META,
    action: 'Connect wallet',
    category: WALLET_CATEGORY,
  },
  WALLET_CONNECT: {
    event: EventType.META,
    action: 'WalletConnect peer',
    category: WALLET_CATEGORY,
  },
  OFF_CHAIN_SIGNATURE: {
    event: EventType.META,
    action: 'Off-chain signature',
    category: WALLET_CATEGORY,
  },
  // Please note that this event isn't triggered for any on-chain interaction.
  // It's only triggered on safe tx execution and batch execution.
  ON_CHAIN_INTERACTION: {
    event: EventType.META,
    action: 'On-chain interaction',
    category: WALLET_CATEGORY,
  },
  SIGN_MESSAGE: {
    event: EventType.META,
    action: 'Sign message',
    category: WALLET_CATEGORY,
  },
  CONFIRM_MESSAGE: {
    event: EventType.META,
    action: 'Confirm message',
    category: WALLET_CATEGORY,
  },
  RELAYED_EXECUTION: {
    event: EventType.META,
    action: 'Relayed execution',
    category: WALLET_CATEGORY,
  },
}
