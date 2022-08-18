import { GTM_EVENT } from '@/services/analytics/types'

const ASSETS_CATEGORY = 'assets'

export const ASSETS_EVENTS = {
  CURRENCY_MENU: {
    action: 'Currency menu',
    category: ASSETS_CATEGORY,
  },
  CHANGE_CURRENCY: {
    event: GTM_EVENT.META,
    action: 'Change currency',
    category: ASSETS_CATEGORY,
  },
  DIFFERING_TOKENS: {
    event: GTM_EVENT.META,
    action: 'Tokens',
    category: ASSETS_CATEGORY,
  },
  // TODO: How should we now track this as we paginate items?
  NFT_AMOUNT: {
    event: GTM_EVENT.META,
    action: 'NFTs',
    category: ASSETS_CATEGORY,
  },
  SEND: {
    action: 'Send',
    category: ASSETS_CATEGORY,
  },
  // TODO: Does not yet exist in web-core
  RECEIVE: {
    action: 'Receive',
    category: ASSETS_CATEGORY,
  },
}
