import React, { Fragment, useState, type ReactElement } from 'react'
import { useRouter } from 'next/router'
import ListItemButton from '@mui/material/ListItemButton'
import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import List from '@mui/material/List'
import Link from 'next/link'

import {
  SidebarList,
  SidebarListItemButton,
  SidebarListItemIcon,
  SidebarListItemText,
} from '@/components/sidebar/SidebarList'

import css from './styles.module.css'
import { AppRoutes } from '@/config/routes'

type NavItem = {
  label: string
  icon?: string
  href: string
  items?: NavItem[]
}

const navItems: NavItem[] = [
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
        label: 'Spending Limit',
        href: AppRoutes.safe.settings.spendingLimit,
      },
      {
        label: 'Modules',
        href: AppRoutes.safe.settings.modules,
      },
    ],
  },
]

const Navigation = (): ReactElement => {
  const router = useRouter()
  const [open, setOpen] = useState<Record<string, boolean>>({})

  const toggleOpen = ({ href }: NavItem) => {
    setOpen((prev) => ({ [href]: !prev[href] }))
  }

  const isSelected = (href: string) => router.pathname === href

  return (
    <SidebarList>
      {navItems.map((item) => {
        if (!item.items) {
          return (
            <SidebarListItemButton
              selected={isSelected(item.href)}
              href={{ pathname: item.href, query: router.query }}
              key={item.href}
            >
              {item.icon && (
                <SidebarListItemIcon>
                  <img src={item.icon} alt={item.label} height="16px" width="16px" />
                </SidebarListItemIcon>
              )}
              <SidebarListItemText bold>{item.label}</SidebarListItemText>
            </SidebarListItemButton>
          )
        }

        const isExpanded = open[item.href] || router.pathname.includes(item.href)

        return (
          <Fragment key={item.href}>
            <SidebarListItemButton
              onClick={() => toggleOpen(item)}
              selected={isExpanded}
              href={{ pathname: item.href, query: { safe: router.query.safe } }}
            >
              {item.icon && (
                <SidebarListItemIcon>
                  <img src={item.icon} alt={item.label} height="16px" width="16px" />
                </SidebarListItemIcon>
              )}
              <SidebarListItemText bold>{item.label}</SidebarListItemText>
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </SidebarListItemButton>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List
                component="nav"
                className={css.sublist}
                sx={({ palette }) => ({
                  borderLeft: `solid 1px ${palette.border.light}`,
                  '::after': {
                    content: '""',
                    height: '23px',
                    width: '1px',
                    position: 'absolute',
                    bottom: 0,
                    left: '-1px',
                    backgroundColor: 'background.paper', // Cannot move to CSS module
                  },
                })}
              >
                {item.items.map((subItem) => (
                  <Link
                    href={{ pathname: subItem.href, query: { safe: router.query.safe } }}
                    passHref
                    key={subItem.href}
                  >
                    <ListItemButton
                      onClick={() => toggleOpen(subItem)}
                      selected={isSelected(subItem.href)}
                      sx={({ palette }) => ({
                        '::before': {
                          content: '""',
                          width: '6px',
                          height: '1px',
                          background: palette.border.light,
                          position: 'absolute',
                          left: '-10px',
                        },
                        borderRadius: '6px',
                        '&.MuiListItemButton-root': {
                          pl: '26px',
                        },
                        '&.MuiListItemButton-root:hover, &.MuiListItemButton-root.Mui-selected': {
                          backgroundColor: `${palette.border.background} !important`,
                        },
                      })}
                    >
                      <SidebarListItemText>{subItem.label}</SidebarListItemText>
                    </ListItemButton>
                  </Link>
                ))}
              </List>
            </Collapse>
          </Fragment>
        )
      })}
    </SidebarList>
  )
}

export default React.memo(Navigation)
