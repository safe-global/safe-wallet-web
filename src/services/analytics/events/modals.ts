import { EventType } from '@/services/analytics/types'

export const MODALS_CATEGORY = 'modals'

export const MODALS_EVENTS = {
  SEND_FUNDS: {
    // TODO: Should we rename this to 'Send tokens' as in UI?
    action: 'Send funds',
    category: MODALS_CATEGORY,
  },
  // TODO: Should we rename this to 'Send NFTs' as in UI?
  SEND_COLLECTIBLE: {
    action: 'Send collectible',
    category: MODALS_CATEGORY,
  },
  // TODO: Does not yet exist in web-core
  CONTRACT_INTERACTION: {
    action: 'Contract interaction',
    category: MODALS_CATEGORY,
  },
  // TODO: !!! Cannot find implementation
  ADVANCED_PARAMS: {
    action: 'Advanced params',
    category: MODALS_CATEGORY,
  },
  // TODO: !!! Cannot find implementation
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
  // TODO: Does not yet exist in web-core
  USE_SPENDING_LIMIT: {
    event: EventType.META,
    action: 'Use spending limit',
    category: MODALS_CATEGORY,
  },
  // TODO: Does not yet exist in web-core
  SIMULATE_TX: {
    action: 'Simulate transaction',
    category: MODALS_CATEGORY,
  },
}
