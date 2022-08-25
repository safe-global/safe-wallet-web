import { EventType } from '@/services/analytics/types'

const TX_LIST_CATEGORY = 'tx-list'

export const TX_LIST_EVENTS = {
  QUEUED_TXS: {
    event: EventType.META,
    action: 'Queued transactions',
    category: TX_LIST_CATEGORY,
  },
  // TODO: label: 'Edit' does not exist in web-core
  ADDRESS_BOOK: {
    action: 'Update address book',
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
  // TODO: Does not yet exist in web-core
  FILTER: {
    action: 'Filter transactions',
    category: TX_LIST_CATEGORY,
  },
  // TODO: Does not yet exist in web-core
  BATCH_EXECUTE: {
    action: 'Batch Execute',
    category: TX_LIST_CATEGORY,
  },
}
