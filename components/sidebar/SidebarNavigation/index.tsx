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
  const [open, setOpen] = useState<string>(router.pathname)

  useEffect(() => {
    setOpen(router.pathname)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.safe])

  const toggleOpen = (href: string) => {
    setOpen((prev) => (prev === href ? '' : href))
  }

  const isOpen = (href: string) => {
    return open === href
  }

  return (
    <SidebarList>
      {navItems.map((item) => {
        if (!item.items) {
          return (
            <ListItem disablePadding>
              <SidebarListItemButton
                onClick={() => setOpen(item.href)}
                selected={isOpen(item.href)}
                href={{ pathname: item.href, query }}
                key={item.href}
              >
                {item.icon && (
                  <SidebarListItemIcon
                    sx={{
                      '& svg path': {
                        fill: ({ palette }) => (isOpen(item.href) ? palette.primary.main : palette.secondary.main),
                      },
                    }}
                  >
                    {item.icon}
                  </SidebarListItemIcon>
                )}
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
              {item.icon && (
                <SidebarListItemIcon
                  sx={{
                    '& svg path': {
                      fill: ({ palette }) => (isOpen(item.href) ? palette.primary.main : palette.secondary.main),
                    },
                  }}
                >
                  {item.icon}
                </SidebarListItemIcon>
              )}

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
                        onClick={() => setOpen(subItem.href)}
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
