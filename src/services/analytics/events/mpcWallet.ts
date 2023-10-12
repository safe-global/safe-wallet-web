import { EventType } from '@/services/analytics/types'

const MPC_WALLET_CATEGORY = 'mpc-wallet'

export const MPC_WALLET_EVENTS = {
  CONNECT_GOOGLE: {
    event: EventType.CLICK,
    action: 'Continue with Google button',
    category: MPC_WALLET_CATEGORY,
  },
  MANUAL_RECOVERY: {
    event: EventType.META,
    action: 'Account recovery started',
    category: MPC_WALLET_CATEGORY,
  },
  RECOVER_PASSWORD: {
    event: EventType.CLICK,
    action: 'Recover account using password',
    category: MPC_WALLET_CATEGORY,
  },
  UPSERT_PASSWORD: {
    event: EventType.CLICK,
    action: 'Set or change password',
    category: MPC_WALLET_CATEGORY,
  },
  ENABLE_MFA: {
    event: EventType.META,
    action: 'Enable MFA for account',
    category: MPC_WALLET_CATEGORY,
  },
}
