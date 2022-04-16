import React, { ReactElement, useState } from 'react'
import Link from 'next/link'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import List from '@mui/material/List'

import useSafeAddress from 'services/useSafeAddress'
import chains from 'config/chains'
import { useRouter } from 'next/router'

type NavItem = {
  label: string
  href: string
  items?: NavItem[]
}

const navItems: NavItem[] = [
  {
    label: 'Assets',
    href: '/balances',
    items: [
      {
        label: 'Coins',
        href: '/balances',
      },
      {
        label: 'NFTs',
        href: '/balances/nfts',
      },
    ],
  },
  {
    label: 'Transactions',
    href: '/transactions/history',
    items: [
      {
        label: 'Queue',
        href: '/transactions/queue',
      },
      {
        label: 'History',
        href: '/transactions/history',
      },
    ],
  },
  {
    label: 'Address Book',
    href: '/address-book',
  },
  {
    label: 'Apps',
    href: '/apps',
  },
  {
    label: 'Settings',
    href: '/settings/details',
    items: [
      {
        label: 'Safe Details',
        href: '/settings/details',
      },
      {
        label: 'Appearance',
        href: '/settings/appearance',
      },
      {
        label: 'Owners',
        href: '/settings/owners',
      },
      {
        label: 'Policies',
        href: '/settings/policies',
      },
      {
        label: 'Spending Limit',
        href: '/settings/spending-limit',
      },
      {
        label: 'Advanced',
        href: '/settings/advanced',
      },
    ],
  },
]

const Navigation = () => {
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const { address, chainId } = useSafeAddress()
  const shortName = Object.keys(chains).find((key) => chains[key] === chainId)

  const toggleOpen = (item: NavItem) => {
    setOpen((prev) => ({ [item.href]: !prev[item.href] }))
  }

  return (
    <List component="nav">
      {navItems.map((item, index) =>
        item.items ? (
          <MultiLevel
            item={item}
            baseUrl={`/${shortName}:${address}`}
            open={open[item.href]}
            toggleOpen={() => toggleOpen(item)}
          />
        ) : (
          <SingleLevel item={item} baseUrl={`/${shortName}:${address}`} />
        ),
      )}
    </List>
  )
}

const SingleLevel = ({ item, baseUrl }: { item: NavItem; baseUrl: string }): ReactElement => {
  const router = useRouter()
  const destination = `${baseUrl}${item.href}`
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
  baseUrl,
  open,
  toggleOpen,
}: {
  item: NavItem
  baseUrl: string
  open: boolean
  toggleOpen: () => void
}): ReactElement => {
  const destination = `${baseUrl}${item.href}`
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
            const subItemDestination = `${baseUrl}${subItem.href}`
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
