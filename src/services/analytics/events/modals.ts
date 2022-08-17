import { GTM_EVENT } from '@/services/analytics/analytics'

const MODALS_CATEGORY = 'modals'

export const MODALS_EVENTS = {
  SEND_FUNDS: {
    action: 'Send funds',
    category: MODALS_CATEGORY,
  },
  SEND_COLLECTIBLE: {
    action: 'Send collectible',
    category: MODALS_CATEGORY,
  },
  CONTRACT_INTERACTION: {
    action: 'Contract interaction',
    category: MODALS_CATEGORY,
  },
  ADVANCED_PARAMS: {
    action: 'Advanced params',
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
  EDIT_ESTIMATION: {
    action: 'Edit estimation',
    category: MODALS_CATEGORY,
  },
  EXECUTE_TX: {
    action: 'Execute transaction',
    category: MODALS_CATEGORY,
  },
  USE_SPENDING_LIMIT: {
    event: GTM_EVENT.META,
    action: 'Use spending limit',
    category: MODALS_CATEGORY,
  },
  SIMULATE_TX: {
    action: 'Simulate transaction',
    category: MODALS_CATEGORY,
  },
}
