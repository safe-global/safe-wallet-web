import React, { ReactElement, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import List from '@mui/material/List'

import useSafeAddress from '@/services/useSafeAddress'
import chains from '@/config/chains'

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
    href: '/safe/settings/details',
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
  const { address, chainId } = useSafeAddress()
  const shortName = Object.keys(chains).find((key) => chains[key] === chainId)
  const query = `?safe=${shortName}:${address}`

  const toggleOpen = (item: NavItem) => {
    setOpen((prev) => ({ [item.href]: !prev[item.href] }))
  }

  return (
    <List component="nav">
      {navItems.map((item) =>
        item.items ? (
          <MultiLevel
            key={item.href}
            item={item}
            query={query}
            open={open[item.href]}
            toggleOpen={() => toggleOpen(item)}
          />
        ) : (
          <SingleLevel item={item} query={query} key={item.href} />
        ),
      )}
    </List>
  )
}

const SingleLevel = ({ item, query }: { item: NavItem; query: string }): ReactElement => {
  const router = useRouter()
  const destination = `${item.href}${query}`
  const selected = router.asPath === destination

  return (
    <Link href={destination} passHref>
      <ListItemButton component="a" selected={selected}>
        <ListItemText>{item.label}</ListItemText>
      </ListItemButton>
    </Link>
  )
}

const MultiLevel = ({
  item,
  query,
  open,
  toggleOpen,
}: {
  item: NavItem
  query: string
  open: boolean
  toggleOpen: () => void
}): ReactElement => {
  const destination = `${item.href}${query}`
  const router = useRouter()

  return (
    <>
      <Link href={destination} passHref>
        <ListItemButton component="a" onClick={toggleOpen}>
          <ListItemText>{item.label}</ListItemText>
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
      </Link>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="nav">
          {item.items?.map((subItem) => {
            const subItemDestination = `${subItem.href}${query}`
            const selected = router.asPath === subItemDestination

            return (
              <Link href={subItemDestination} passHref key={subItem.label}>
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
