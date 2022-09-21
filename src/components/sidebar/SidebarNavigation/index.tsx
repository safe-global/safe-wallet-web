import React, { useState, type ReactElement, useEffect } from 'react'
import { useRouter } from 'next/router'
import ListItemButton from '@mui/material/ListItemButton'
import ListItem from '@mui/material/ListItem'
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
import { navItems } from './config'

import css from './styles.module.css'

const Navigation = (): ReactElement => {
  const router = useRouter()
  const query = { safe: router.query.safe }
  const [openHref, setOpenHref] = useState<string>(router.pathname)

  useEffect(() => {
    setOpenHref(router.pathname)
  }, [router.pathname, query.safe])

  const toggleOpen = (href: string) => {
    setOpenHref((prev) => (prev === href ? '' : href))
  }

  const isOpen = (href: string) => {
    return openHref === href
  }

  return (
    <SidebarList>
      {navItems.map((item) => {
        // TODO: We are aware of the submenu highlighting bug. It's insignificant as submenus will be soon removed
        if (!item.items) {
          return (
            <ListItem key={item.href} disablePadding selected={router.pathname === item.href}>
              <SidebarListItemButton
                onClick={() => setOpenHref(item.href)}
                selected={isOpen(item.href)}
                href={{ pathname: item.href, query }}
              >
                {item.icon && <SidebarListItemIcon>{item.icon}</SidebarListItemIcon>}
                <SidebarListItemText bold>{item.label}</SidebarListItemText>
              </SidebarListItemButton>
            </ListItem>
          )
        }

        const isExpanded = isOpen(item.href) || item.items.some((subItem) => isOpen(subItem.href))

        return (
          <ListItem key={item.href} disablePadding sx={{ display: 'block' }}>
            <SidebarListItemButton
              onClick={() => toggleOpen(item.href)}
              selected={isExpanded}
              href={{ pathname: item.href, query }}
            >
              {item.icon && <SidebarListItemIcon>{item.icon}</SidebarListItemIcon>}

              <SidebarListItemText bold>{item.label}</SidebarListItemText>

              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </SidebarListItemButton>

            <Collapse in={isExpanded} timeout="auto" unmountOnExit sx={{ marginTop: '4px' }}>
              <List className={css.sublist}>
                {item.items.map((subItem) => (
                  <ListItem key={subItem.href} disablePadding>
                    <Link href={{ pathname: subItem.href, query }} passHref>
                      <ListItemButton
                        className={css.sublistItem}
                        onClick={() => setOpenHref(subItem.href)}
                        selected={isOpen(subItem.href)}
                      >
                        <SidebarListItemText>{subItem.label}</SidebarListItemText>
                      </ListItemButton>
                    </Link>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </ListItem>
        )
      })}
    </SidebarList>
  )
}

export default React.memo(Navigation)
