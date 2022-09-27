import React, { useState, type ReactElement, useEffect } from 'react'
import { useRouter } from 'next/router'
import ListItem from '@mui/material/ListItem'

import {
  SidebarList,
  SidebarListItemButton,
  SidebarListItemIcon,
  SidebarListItemText,
} from '@/components/sidebar/SidebarList'
import { navItems } from './config'

const Navigation = (): ReactElement => {
  const router = useRouter()
  const query = { safe: router.query.safe }
  const [openHref, setOpenHref] = useState<string>(router.pathname)

  useEffect(() => {
    setOpenHref(router.pathname)
  }, [router.pathname, query.safe])

  return (
    <SidebarList>
      {navItems.map((item) => (
        <ListItem key={item.href} disablePadding selected={router.pathname === item.href}>
          <SidebarListItemButton
            onClick={() => setOpenHref(item.href)}
            selected={openHref === item.href}
            href={{ pathname: item.href, query }}
          >
            {item.icon && <SidebarListItemIcon>{item.icon}</SidebarListItemIcon>}
            <SidebarListItemText bold>{item.label}</SidebarListItemText>
          </SidebarListItemButton>
        </ListItem>
      ))}
    </SidebarList>
  )
}

export default React.memo(Navigation)
