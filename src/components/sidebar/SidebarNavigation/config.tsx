import React, { ReactElement } from 'react'
import { AppRoutes } from '@/config/routes'
import HomeIcon from '@/public/images/sidebar/home.svg'
import AssetsIcon from '@/public/images/sidebar/assets.svg'
import TransactionIcon from '@/public/images/sidebar/transactions.svg'
import ABIcon from '@/public/images/sidebar/address-book.svg'
import AppsIcon from '@/public/images/sidebar/apps.svg'
import SettingsIcon from '@/public/images/sidebar/settings.svg'

export type NavItem = {
  label: string
  icon?: ReactElement
  href: string
  items?: NavItem[]
}

export const navItems: NavItem[] = [
  {
    label: 'Home',
    icon: <HomeIcon />,
    href: AppRoutes.safe.home,
  },
  {
    label: 'Assets',
    icon: <AssetsIcon />,
    href: AppRoutes.safe.balances.index,
  },
  {
    label: 'Transactions',
    icon: <TransactionIcon />,
    href: AppRoutes.safe.transactions.history,
  },
  {
    label: 'Address book',
    icon: <ABIcon />,
    href: AppRoutes.safe.addressBook,
  },
  {
    label: 'Apps',
    icon: <AppsIcon />,
    href: AppRoutes.safe.apps,
  },
  {
    label: 'Settings',
    icon: <SettingsIcon />,
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
      {
        label: 'Spending limits',
        href: AppRoutes.safe.settings.spendingLimits,
      },
    ],
  },
]

export const transactionNavItems = [
  {
    label: 'Queue',
    href: AppRoutes.safe.transactions.queue,
  },
  {
    label: 'History',
    href: AppRoutes.safe.transactions.history,
  },
]

export const balancesNavItems = [
  {
    label: 'Tokens',
    href: AppRoutes.safe.balances.index,
  },
  {
    label: 'NFTs',
    href: AppRoutes.safe.balances.nfts,
  },
]
