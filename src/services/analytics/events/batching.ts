export const category = 'batching'

export const BATCH_EVENTS = {
  // Click on the batch button in header
  BATCH_SIDEBAR_OPEN: {
    action: 'Batch sidebar open',
    category,
  },
  // On "Add to batch" click
  BATCH_APPEND: {
    action: 'Add to batch',
    category,
  },
  // When a tx is successfully appended to the batch
  BATCH_TX_APPENDED: {
    action: 'Tx added to batch',
    category,
  },
  // When batch item details are expanded
  BATCH_EXPAND_TX: {
    action: 'Expand batched tx',
    category,
  },
  // When batch item is removed
  BATCH_DELETE_TX: {
    action: 'Delete batched tx',
    category,
  },
  // "Add new transaction" in the batch sidebar
  BATCH_NEW_TX: {
    action: 'Add new tx to batch',
    category,
  },
  // Confirm batch in the batch sidebar
  BATCH_CONFIRM: {
    action: 'Confirm batch',
    category,
  },
}
