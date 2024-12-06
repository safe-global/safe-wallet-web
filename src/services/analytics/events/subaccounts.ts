const SUBACCOUNTS_CATEGORY = 'subaccounts'

export const SUBACCOUNT_EVENTS = {
  OPEN_LIST: {
    action: 'Open Subaccount list',
    category: SUBACCOUNTS_CATEGORY,
  },
  OPEN_SUBACCOUNT: {
    action: 'Open Subaccount',
    category: SUBACCOUNTS_CATEGORY,
  },
  SHOW_ALL: {
    action: 'Show all',
    category: SUBACCOUNTS_CATEGORY,
  },
  ADD: {
    action: 'Add',
    category: SUBACCOUNTS_CATEGORY,
  },
  RENAME: {
    action: 'Rename',
    category: SUBACCOUNTS_CATEGORY,
  },
}

export enum SUBACCOUNT_LABELS {
  header = 'header',
  sidebar = 'sidebar',
  list = 'list',
  success_screen = 'success_screen',
}
