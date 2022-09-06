import { EventType } from '@/services/analytics/types'

const OVERVIEW_CATEGORY = 'overview'

export const OVERVIEW_EVENTS = {
  // TODO: Not yet in web-core
  IPHONE_APP_BUTTON: {
    action: 'Download App',
    category: OVERVIEW_CATEGORY,
  },
  OPEN_ONBOARD: {
    action: 'Open wallet modal',
    category: OVERVIEW_CATEGORY,
  },
  SWITCH_NETWORK: {
    action: 'Switch network',
    category: OVERVIEW_CATEGORY,
  },
  SHOW_QR: {
    action: 'Show Safe QR code',
    category: OVERVIEW_CATEGORY,
  },
  COPY_ADDRESS: {
    action: 'Copy Safe address',
    category: OVERVIEW_CATEGORY,
  },
  OPEN_EXPLORER: {
    action: 'Open Safe on block explorer',
    category: OVERVIEW_CATEGORY,
  },
  ADD_SAFE: {
    action: 'Add Safe',
    category: OVERVIEW_CATEGORY,
  },
  SIDEBAR: {
    action: 'Sidebar',
    category: OVERVIEW_CATEGORY,
  },
  ADDED_SAFES_ON_NETWORK: {
    event: EventType.META,
    action: 'Added Safes on', // Safe name is appended trackEvent on SafeList
    category: OVERVIEW_CATEGORY,
  },
  WHATS_NEW: {
    action: "Open What's New",
    category: OVERVIEW_CATEGORY,
  },
  HELP_CENTER: {
    action: 'Open Help Center',
    category: OVERVIEW_CATEGORY,
  },
  NEW_TRANSACTION: {
    action: 'New transaction',
    category: OVERVIEW_CATEGORY,
  },
  NOTIFICATION_CENTER: {
    action: 'Open Notification Center',
    category: OVERVIEW_CATEGORY,
  },
  NOTIFICATION_INTERACTION: {
    action: 'Interact with notification',
    category: OVERVIEW_CATEGORY,
  },
  SIDEBAR_RENAME: {
    action: 'Rename Safe from sidebar',
    category: OVERVIEW_CATEGORY,
  },
  SIDEBAR_REMOVE: {
    action: 'Remove Safe from sidebar',
    category: OVERVIEW_CATEGORY,
  },
  SAFE_TOKEN_WIDGET: {
    action: 'Open Safe Claiming App from widget',
    category: OVERVIEW_CATEGORY,
  },
}
