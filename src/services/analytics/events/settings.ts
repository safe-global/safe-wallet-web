import { GTM_EVENT } from '@/services/analytics/analytics'

const SETTINGS_CATEGORY = 'settings'

export const SETTINGS_EVENTS = {
  DETAILS: {
    SAFE_NAME: {
      action: 'Name Safe',
      category: SETTINGS_CATEGORY,
    },
  },
  APPEARANCE: {
    PREPEND_PREFIXES: {
      action: 'Prepend EIP-3770 prefixes',
      category: SETTINGS_CATEGORY,
    },
    COPY_PREFIXES: {
      action: 'Copy EIP-3770 prefixes',
      category: SETTINGS_CATEGORY,
    },
    INVERT_COLORS: {
      action: 'Invert colors',
      category: SETTINGS_CATEGORY,
    },
  },
  OWNERS: {
    REMOVE_SAFE: {
      action: 'Remove Safe',
      category: SETTINGS_CATEGORY,
    },
    ADD_OWNER: {
      action: 'Add owner',
      category: SETTINGS_CATEGORY,
    },
    EDIT_OWNER: {
      action: 'Edit owner',
      category: SETTINGS_CATEGORY,
    },
    REPLACE_OWNER: {
      action: 'Replace owner',
      category: SETTINGS_CATEGORY,
    },
    REMOVE_OWNER: {
      action: 'Remove owner',
      category: SETTINGS_CATEGORY,
    },
  },
  THRESHOLD: {
    CHANGE: {
      action: 'Change threshold',
      category: SETTINGS_CATEGORY,
    },
    OWNERS: {
      event: GTM_EVENT.META,
      action: 'Owners',
      category: SETTINGS_CATEGORY,
    },
    THRESHOLD: {
      event: GTM_EVENT.META,
      action: 'Threshold',
      category: SETTINGS_CATEGORY,
    },
  },
  SPENDING_LIMIT: {
    NEW_LIMIT: {
      action: 'New spending limit',
      category: SETTINGS_CATEGORY,
    },
    RESET_PERIOD: {
      event: GTM_EVENT.META,
      action: 'Spending limit reset period',
      category: SETTINGS_CATEGORY,
    },
    REMOVE_LIMIT: {
      action: 'Remove spending limit',
      category: SETTINGS_CATEGORY,
    },
    LIMIT_REMOVED: {
      action: 'Spending limit removed',
      category: SETTINGS_CATEGORY,
    },
  },
}
