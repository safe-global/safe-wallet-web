export const AppRoutes = {
  welcome: '/welcome',
  open: '/open',
  load: '/load',
  index: '/',
  demoTheme: '/demo-theme',
  safe: {
    index: '/safe',
    home: '/safe/home',
    apps: '/safe/apps',
    addressBook: '/safe/address-book',
    balances: {
      nfts: '/safe/balances/nfts',
      index: '/safe/balances',
    },
    settings: {
      spendingLimit: '/safe/settings/spending-limit',
      setup: '/safe/settings/setup',
      modules: '/safe/settings/modules',
      index: '/safe/settings',
      details: '/safe/settings/details',
      appearance: '/safe/settings/appearance',
    },
    transactions: {
      queue: '/safe/transactions/queue',
      index: '/safe/transactions',
      history: '/safe/transactions/history',
      txId: '/safe/transactions/[txId]',
    },
  },
}
