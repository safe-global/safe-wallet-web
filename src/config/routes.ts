export const AppRoutes = {
  '404': '/404',
  welcome: '/welcome',
  index: '/',
  import: '/import',
  environmentVariables: '/environment-variables',
  home: '/home',
  apps: {
    index: '/apps',
    bookmarked: '/apps/bookmarked',
    custom: '/apps/custom',
  },
  addressBook: '/address-book',
  balances: {
    nfts: '/balances/nfts',
    index: '/balances',
  },
  newSafe: {
    create: '/new-safe/create',
    load: '/new-safe/load',
  },
  settings: {
    spendingLimits: '/settings/spending-limits',
    setup: '/settings/setup',
    modules: '/settings/modules',
    index: '/settings',
    data: '/settings/data',
    appearance: '/settings/appearance',
    environmentVariables: '/settings/environment-variables',
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
