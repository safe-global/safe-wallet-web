export const AppRoutes = {
  '404': '/404',
  welcome: '/welcome',
  open: '/open',
  load: '/load',
  index: '/',
  home: '/home',
  apps: '/apps',
  addressBook: '/address-book',
  balances: {
    nfts: '/balances/nfts',
    index: '/balances',
  },
  newSafe: {
    create: '/new-safe/create',
    add: '/new-safe/add',
  },
  settings: {
    spendingLimits: '/settings/spending-limits',
    setup: '/settings/setup',
    modules: '/settings/modules',
    index: '/settings',
    appearance: '/settings/appearance',
    safeApps: {
      index: '/settings/safe-apps',
    },
  },
  share: {
    safeApp: '/share/safe-app',
  },
  transactions: {
    tx: '/transactions/tx',
    queue: '/transactions/queue',
    index: '/transactions',
    history: '/transactions/history',
  },
}
