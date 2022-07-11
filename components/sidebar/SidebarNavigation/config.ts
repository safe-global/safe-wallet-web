import { AppRoutes } from '@/config/routes'

export type NavItem = {
  label: string
  icon?: string
  href: string
  items?: NavItem[]
}

export const navItems: NavItem[] = [
  {
    label: 'Home',
    icon: '/images/sidebar/home.svg', // TODO: Include thick icon from design
    href: AppRoutes.safe.home,
  },
  {
    label: 'Assets',
    icon: '/images/sidebar/assets.svg',
    href: AppRoutes.safe.balances.index,
    items: [
      {
        label: 'Coins',
        href: AppRoutes.safe.balances.index,
      },
      {
        label: 'NFTs',
        href: AppRoutes.safe.balances.nfts,
      },
    ],
  },
  {
    label: 'Transactions',
    icon: '/images/sidebar/transactions.svg',
    href: AppRoutes.safe.transactions.history,
    items: [
      {
        label: 'Queue',
        href: AppRoutes.safe.transactions.queue,
      },
      {
        label: 'History',
        href: AppRoutes.safe.transactions.history,
      },
    ],
  },
  {
    label: 'Address Book',
    icon: '/images/sidebar/address-book.svg',
    href: AppRoutes.safe.addressBook,
  },
  {
    label: 'Apps',
    icon: '/images/sidebar/apps.svg',
    href: AppRoutes.safe.apps,
  },
  {
    label: 'Settings',
    icon: '/images/sidebar/settings.svg',
    href: AppRoutes.safe.settings.setup,
    items: [
      {
        label: 'Setup',
        href: AppRoutes.safe.settings.setup,
      },
      {
        label: 'Appearance',
        href: AppRoutes.safe.settings.appearance,
      },
      {
        label: 'Modules',
        href: AppRoutes.safe.settings.modules,
      },
    ],
  },
]
