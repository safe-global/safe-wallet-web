import React, { ReactElement, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import List from '@mui/material/List'

type NavItem = {
  label: string
  href: string
  items?: NavItem[]
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/safe',
  },
  {
    label: 'Assets',
    href: '/safe/balances',
    items: [
      {
        label: 'Coins',
        href: '/safe/balances',
      },
      {
        label: 'NFTs',
        href: '/safe/balances/nfts',
      },
    ],
  },
  {
    label: 'Transactions',
    href: '/safe/transactions/history',
    items: [
      {
        label: 'Queue',
        href: '/safe/transactions/queue',
      },
      {
        label: 'History',
        href: '/safe/transactions/history',
      },
    ],
  },
  {
    label: 'Address Book',
    href: '/safe/address-book',
  },
  {
    label: 'Apps',
    href: '/safe/apps',
  },
  {
    label: 'Settings',
    href: '/safe/settings',
    items: [
      {
        label: 'Setup',
        href: '/safe/settings/setup',
      },
      {
        label: 'Modules',
        href: '/safe/settings/modules',
      },
      {
        label: 'Appearance',
        href: '/safe/settings/appearance',
      },
    ],
  },
]

const Navigation = () => {
  const [open, setOpen] = useState<Record<string, boolean>>({})

  const toggleOpen = (item: NavItem) => {
    setOpen((prev) => ({ [item.href]: !prev[item.href] }))
  }

  return (
    <List component="nav">
      {navItems.map((item) =>
        item.items ? (
          <MultiLevel key={item.href} item={item} open={open[item.href]} toggleOpen={() => toggleOpen(item)} />
        ) : (
          <SingleLevel item={item} key={item.href} />
        ),
      )}
    </List>
  )
}

const SingleLevel = ({ item }: { item: NavItem }): ReactElement => {
  const router = useRouter()
  const selected = router.pathname === item.href

  return (
    <Link href={{ pathname: item.href, query: router.query }} passHref>
      <ListItemButton component="a" selected={selected}>
        <ListItemText>{item.label}</ListItemText>
      </ListItemButton>
    </Link>
  )
}

const MultiLevel = ({
  item,
  open,
  toggleOpen,
}: {
  item: NavItem
  open: boolean
  toggleOpen: () => void
}): ReactElement => {
  const router = useRouter()

  return (
    <>
      <Link href={{ pathname: item.href, query: router.query }} passHref>
        <ListItemButton component="a" onClick={toggleOpen}>
          <ListItemText>{item.label}</ListItemText>
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
      </Link>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="nav">
          {item.items?.map((subItem) => {
            const selected = router.pathname === subItem.href

            return (
              <Link href={{ pathname: subItem.href, query: router.query }} passHref key={subItem.label}>
                <ListItemButton component="a" selected={selected}>
                  <ListItemText>{subItem.label}</ListItemText>
                </ListItemButton>
              </Link>
            )
          })}
        </List>
      </Collapse>
    </>
  )
}

export default React.memo(Navigation)
