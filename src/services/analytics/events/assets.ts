import { GTM_EVENT } from '@/services/analytics/analytics'

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
  NFT_AMOUNT: {
    event: GTM_EVENT.META,
    action: 'NFTs',
    category: ASSETS_CATEGORY,
  },
  SEND: {
    action: 'Send',
    category: ASSETS_CATEGORY,
  },
  RECEIVE: {
    action: 'Receive',
    category: ASSETS_CATEGORY,
  },
}
