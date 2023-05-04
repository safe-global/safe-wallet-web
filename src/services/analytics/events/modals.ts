import { EventType } from '@/services/analytics/types'

export const MODALS_CATEGORY = 'modals'

export const MODALS_EVENTS = {
  SEND_FUNDS: {
    action: 'Send tokens',
    category: MODALS_CATEGORY,
  },
  SEND_COLLECTIBLE: {
    action: 'Send NFTs',
    category: MODALS_CATEGORY,
  },
  CONTRACT_INTERACTION: {
    action: 'Contract interaction',
    category: MODALS_CATEGORY,
  },
  SCAN_QR: {
    action: 'Scan QR',
    category: MODALS_CATEGORY,
  },
  TX_DETAILS: {
    action: 'Transaction details',
    category: MODALS_CATEGORY,
  },
  EDIT_ADVANCED_PARAMS: {
    action: 'Edit advanced params',
    category: MODALS_CATEGORY,
  },
  ESTIMATION: {
    action: 'Estimation',
    category: MODALS_CATEGORY,
  },
  EXECUTE_TX: {
    action: 'Execute transaction',
    category: MODALS_CATEGORY,
  },
  USE_SPENDING_LIMIT: {
    event: EventType.META,
    action: 'Use spending limit',
    category: MODALS_CATEGORY,
  },
  SIMULATE_TX: {
    action: 'Simulate transaction',
    category: MODALS_CATEGORY,
  },
  REJECT_TX: {
    action: 'Reject transaction',
    category: MODALS_CATEGORY,
  },
  EDIT_APPROVALS: {
    action: 'Edit approval',
    category: MODALS_CATEGORY,
  },
  PROPOSE_TX: {
    action: 'Propose transaction',
    category: MODALS_CATEGORY,
  },
}
