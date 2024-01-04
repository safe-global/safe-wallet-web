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
  safeapps = 'safeapps',
  walletconnect = 'walletconnect',
  custom = 'custom',
}

const TX_CATEGORY = 'transactions'

export const TX_EVENTS = {
  CREATE: {
    event: 'tx_create',
    action: 'Create transaction',
    category: TX_CATEGORY,
    // label: TX_TYPES,
  },
  CONFIRM: {
    event: 'tx_confirm',
    action: 'Confirm transaction',
    category: TX_CATEGORY,
  },
  EXECUTE: {
    event: 'tx_execute',
    action: 'Execute transaction',
    category: TX_CATEGORY,
  },
}
