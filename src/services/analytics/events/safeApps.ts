import { EventType } from '@/services/analytics/types'

const SAFE_APPS_CATEGORY = 'safe-apps'

// TODO: Does not yet exist in web-core
export const SAFE_APPS_EVENTS = {
  OPEN_APP: {
    action: 'Open Safe App',
    category: SAFE_APPS_CATEGORY,
  },
  PIN: {
    action: 'Pin Safe App',
    category: SAFE_APPS_CATEGORY,
  },
  UNPIN: {
    action: 'Unpin Safe App',
    category: SAFE_APPS_CATEGORY,
  },
  SEARCH: {
    event: EventType.META,
    action: 'Search for Safe App',
    category: SAFE_APPS_CATEGORY,
  },
  ADD_CUSTOM_APP: {
    event: EventType.META,
    action: 'Add custom Safe App',
    category: SAFE_APPS_CATEGORY,
  },
  TRANSACTION_CONFIRMED: {
    event: EventType.META,
    action: 'Transaction Confirmed',
    category: SAFE_APPS_CATEGORY,
  },
  TRANSACTION_REJECTED: {
    event: EventType.META,
    action: 'Transaction Rejected',
    category: SAFE_APPS_CATEGORY,
  },
  LEGACY_API_CALL: {
    event: EventType.META,
    action: 'Legacy API call',
    category: SAFE_APPS_CATEGORY,
  },
  SHARED_APP_LANDING: {
    event: EventType.META,
    action: 'Shared App landing page visited',
    category: SAFE_APPS_CATEGORY,
  },
  SHARED_APP_CHAIN_ID: {
    event: EventType.META,
    action: 'Shared App chainId',
    category: SAFE_APPS_CATEGORY,
  },
  SHARED_APP_OPEN_DEMO: {
    event: EventType.META,
    action: 'Open demo safe from shared app',
    category: SAFE_APPS_CATEGORY,
  },
  SHARED_APP_OPEN_AFTER_SAFE_CREATION: {
    event: EventType.META,
    action: 'Open shared app after Safe creation',
    category: SAFE_APPS_CATEGORY,
  },
}
