import { EventType } from '../types'

export enum TX_TYPES {
  // Settings
  owner_add = 'owner_add',
  owner_remove = 'owner_remove',
  owner_swap = 'owner_swap',
  owner_threshold_change = 'owner_threshold_change',

  // Module txs
  guard_remove = 'guard_remove',
  module_remove = 'module_remove',

  // Transfers
  transfer_token = 'transfer_token',
  transfer_nft = 'transfer_nft',

  // Other
  batch = 'batch',
  rejection = 'rejection',
  typed_message = 'typed_message',
  walletconnect = 'walletconnect',
  custom = 'custom',

  // Counterfactual
  activate_without_tx = 'activate_without_tx',
  activate_with_tx = 'activate_with_tx',
}

const TX_CATEGORY = 'transactions'

export const TX_EVENTS = {
  CREATE: {
    event: EventType.TX_CREATED,
    action: 'Create transaction',
    category: TX_CATEGORY,
    // label: TX_TYPES,
  },
  CONFIRM: {
    event: EventType.TX_CONFIRMED,
    action: 'Confirm transaction',
    category: TX_CATEGORY,
  },
  EXECUTE: {
    event: EventType.TX_EXECUTED,
    action: 'Execute transaction',
    category: TX_CATEGORY,
  },
}
