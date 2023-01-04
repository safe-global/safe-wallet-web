import { EventType } from '@/services/analytics/types'

const ASSETS_CATEGORY = 'assets'

export const ASSETS_EVENTS = {
  CURRENCY_MENU: {
    action: 'Currency menu',
    category: ASSETS_CATEGORY,
  },
  TOKEN_LIST_MENU: {
    action: 'Token list menu',
    category: ASSETS_CATEGORY,
  },
  CHANGE_CURRENCY: {
    event: EventType.META,
    action: 'Change currency',
    category: ASSETS_CATEGORY,
  },
  TOGGLE_HIDDEN_ASSETS: {
    event: EventType.META,
    action: 'Toggle hidden assets',
    category: ASSETS_CATEGORY,
  },
  DIFFERING_TOKENS: {
    event: EventType.META,
    action: 'Tokens',
    category: ASSETS_CATEGORY,
  },
  HIDDEN_TOKENS: {
    event: EventType.META,
    action: 'Hidden tokens',
    category: ASSETS_CATEGORY,
  },
  SEND: {
    action: 'Send',
    category: ASSETS_CATEGORY,
  },
  HIDE: {
    action: 'Hide',
    category: ASSETS_CATEGORY,
  },
  HIDE_CHECKBOX: {
    action: 'Check hidden token',
    category: ASSETS_CATEGORY,
  },
}
