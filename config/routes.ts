export const AppRoutes = {
  'demo-theme': '/demo-theme',
  index: '/index',
  load: '/load',
  open: '/open',
  safe: {
    'address-book': '/safe/address-book',
    apps: '/safe/apps',
    balances: {
      index: '/safe/balances/index',
      nfts: '/safe/balances/nfts',
    },
    home: '/safe/home',
    index: '/safe/index',
    settings: {
      advanced: '/safe/settings/advanced',
      appearance: '/safe/settings/appearance',
      details: '/safe/settings/details',
      index: '/safe/settings/index',
      owners: '/safe/settings/owners',
      policies: '/safe/settings/policies',
      'spending-limit': '/safe/settings/spending-limit',
    },
    transactions: {
      '[txId]': '/safe/transactions/[txId]',
      history: '/safe/transactions/history',
      index: '/safe/transactions/index',
      queue: '/safe/transactions/queue',
    },
  },
  welcome: '/welcome',
}
