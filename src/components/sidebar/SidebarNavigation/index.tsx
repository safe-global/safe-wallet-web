import React, { type ReactElement } from 'react'
import { useRouter } from 'next/router'
import ListItem from '@mui/material/ListItem'
import { ImplementationVersionState } from '@gnosis.pm/safe-react-gateway-sdk'

import {
  SidebarList,
  SidebarListItemButton,
  SidebarListItemIcon,
  SidebarListItemText,
} from '@/components/sidebar/SidebarList'
import { navItems } from './config'
import useSafeInfo from '@/hooks/useSafeInfo'
import { AppRoutes } from '@/config/routes'

const Navigation = (): ReactElement => {
  const router = useRouter()
  const { safe } = useSafeInfo()

  const needsUpdate = safe.implementationVersionState === ImplementationVersionState.OUTDATED

  return (
    <SidebarList>
      {navItems.map((item) => {
        const isSettings = item.href === AppRoutes.settings.setup

        return (
          <ListItem key={item.href} disablePadding selected={router.pathname === item.href}>
            <SidebarListItemButton
              selected={router.pathname === item.href}
              href={{ pathname: item.href, query: { safe: router.query.safe } }}
            >
              {item.icon && <SidebarListItemIcon badge={isSettings && needsUpdate}>{item.icon}</SidebarListItemIcon>}
              <SidebarListItemText bold>{item.label}</SidebarListItemText>
            </SidebarListItemButton>
          </ListItem>
        )
      })}
    </SidebarList>
  )
}

export default React.memo(Navigation)
