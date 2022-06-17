export const AppRoutes = {
  demoTheme: '/demo-theme',
  index: '/',
  load: '/load',
  open: '/open',
  safe: {
    addressBook: '/safe/address-book',
    apps: '/safe/apps',
    balances: {
      index: '/safe/balances',
      nfts: '/safe/balances/nfts',
    },
    home: '/safe/home',
    index: '/safe',
    settings: {
      advanced: '/safe/settings/advanced',
      appearance: '/safe/settings/appearance',
      details: '/safe/settings/details',
      index: '/safe/settings',
      owners: '/safe/settings/owners',
      policies: '/safe/settings/policies',
      spendingLimit: '/safe/settings/spending-limit',
    },
    transactions: {
      txId: '/safe/transactions/[txId]',
      history: '/safe/transactions/history',
      index: '/safe/transactions',
      queue: '/safe/transactions/queue',
    },
  },
  welcome: '/welcome',
}
