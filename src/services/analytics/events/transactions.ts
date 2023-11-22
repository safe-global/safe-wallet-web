import { EventType } from '../types'

export enum TX_TYPES {
  // Owner txs
  owner_add = 'owner_add',
  owner_remove = 'owner_remove',
  owner_swap = 'owner_swap',
  owner_threshold_change = 'owner_threshold_change',

  // Module txs
  guard_remove = 'guard_remove',
  module_remove = 'module_remove',
  spending_limit_remove = 'spending_limit_remove',
  spending_limit_add = 'spending_limit_add',

  // Safe txs
  safe_update = 'safe_update',

  // Transfers
  transfer_token = 'transfer_token',
  transfer_nft = 'transfer_nft',

  // Other
  batch = 'batch',
  rejection = 'rejection',
  typed_message = 'typed_message',
  safeapps = 'safeapps',
  walletconnect = 'walletconnect',
}

const TX_CATEGORY = 'transactions'

export const TX_EVENTS = {
  CREATE: {
    event: EventType.META,
    action: 'Create transaction',
    category: TX_CATEGORY,
    // label: TX_TYPES,
  },
}
