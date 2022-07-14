export const AppRoutes = {
  welcome: '/welcome',
  open: '/open',
  load: {
    index: '/load',
    safe: '/load/safe',
  },
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
      setup: '/safe/settings/setup',
      modules: '/safe/settings/modules',
      index: '/safe/settings',
      appearance: '/safe/settings/appearance',
    },
    transactions: {
      tx: '/safe/transactions/tx',
      queue: '/safe/transactions/queue',
      index: '/safe/transactions',
      history: '/safe/transactions/history',
    },
  },
}
