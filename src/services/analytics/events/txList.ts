import { EventType } from '@/services/analytics/types'

const TX_LIST_CATEGORY = 'tx-list'

export const TX_LIST_EVENTS = {
  QUEUED_TXS: {
    event: EventType.META,
    action: 'Queued transactions',
    category: TX_LIST_CATEGORY,
  },
  ADDRESS_BOOK: {
    action: 'Add to address book',
    category: TX_LIST_CATEGORY,
  },
  SEND_AGAIN: {
    action: 'Send again',
    category: TX_LIST_CATEGORY,
  },
  COPY_DEEPLINK: {
    action: 'Copy deeplink',
    category: TX_LIST_CATEGORY,
  },
  CONFIRM: {
    action: 'Confirm transaction',
    category: TX_LIST_CATEGORY,
  },
  EXECUTE: {
    action: 'Execute transaction',
    category: TX_LIST_CATEGORY,
  },
  REJECT: {
    action: 'Reject transaction',
    category: TX_LIST_CATEGORY,
  },
  FILTER: {
    action: 'Filter transactions',
    category: TX_LIST_CATEGORY,
  },
  BATCH_EXECUTE: {
    action: 'Batch Execute',
    category: TX_LIST_CATEGORY,
  },
}

export const MESSAGE_EVENTS = {
  SIGN: {
    action: 'Sign message',
    category: TX_LIST_CATEGORY,
  },
}
