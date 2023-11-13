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
    action: 'MFA login started',
    category: MPC_WALLET_CATEGORY,
  },
  RECOVER_PASSWORD: {
    event: EventType.CLICK,
    action: 'Recover account using password',
    category: MPC_WALLET_CATEGORY,
  },
  RECOVERED_SOCIAL_SIGNER: {
    event: EventType.META,
    action: 'Recovered social signer',
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
  REVEAL_PRIVATE_KEY: {
    event: EventType.CLICK,
    action: 'Reveal private key',
    category: MPC_WALLET_CATEGORY,
  },
  EXPORT_PK_SUCCESS: {
    event: EventType.META,
    action: 'Export private key successful',
    category: MPC_WALLET_CATEGORY,
  },
  EXPORT_PK_ERROR: {
    event: EventType.META,
    action: 'Export private key error',
    category: MPC_WALLET_CATEGORY,
  },
  SEE_PK: {
    event: EventType.CLICK,
    action: 'Toggle see private key',
    category: MPC_WALLET_CATEGORY,
  },
  COPY_PK: {
    event: EventType.CLICK,
    action: 'Copy private key',
    category: MPC_WALLET_CATEGORY,
  },
}
