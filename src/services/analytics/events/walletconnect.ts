import { EventType } from '@/services/analytics/types'

const WALLETCONNECT_CATEGORY = 'walletconnect'

export const WALLETCONNECT_EVENTS = {
  CONNECTED: {
    action: 'WC connected',
    category: WALLETCONNECT_CATEGORY,
    event: EventType.META,
  },
  POPUP_OPENED: {
    action: 'WC popup',
    category: WALLETCONNECT_CATEGORY,
  },
  DISCONNECT_CLICK: {
    action: 'WC disconnect click',
    category: WALLETCONNECT_CATEGORY,
  },
  APPROVE_CLICK: {
    action: 'WC approve click',
    category: WALLETCONNECT_CATEGORY,
  },
  REJECT_CLICK: {
    action: 'WC reject click',
    category: WALLETCONNECT_CATEGORY,
  },
  PASTE_CLICK: {
    action: 'WC paste click',
    category: WALLETCONNECT_CATEGORY,
  },
  HINTS_SHOW: {
    action: 'WC show hints',
    category: WALLETCONNECT_CATEGORY,
  },
  HINTS_EXPAND: {
    action: 'WC expand hints',
    category: WALLETCONNECT_CATEGORY,
  },
  SHOW_RISK: {
    action: 'WC show risk',
    category: WALLETCONNECT_CATEGORY,
    event: EventType.META,
  },
  ACCEPT_RISK: {
    action: 'WC accept risk',
    category: WALLETCONNECT_CATEGORY,
  },
}
