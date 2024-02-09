import React, { useMemo, type ReactElement } from 'react'
import { useRouter } from 'next/router'
import ListItem from '@mui/material/ListItem'
import { ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'

import {
  SidebarList,
  SidebarListItemButton,
  SidebarListItemCounter,
  SidebarListItemIcon,
  SidebarListItemText,
} from '@/components/sidebar/SidebarList'
import { type NavItem, navItems } from './config'
import useSafeInfo from '@/hooks/useSafeInfo'
import { AppRoutes } from '@/config/routes'
import { useQueuedTxsLength } from '@/hooks/useTxQueue'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'

const getSubdirectory = (pathname: string): string => {
  return pathname.split('/')[1]
}

const Navigation = (): ReactElement => {
  const router = useRouter()
  const { safe } = useSafeInfo()
  const currentSubdirectory = getSubdirectory(router.pathname)
  const queueSize = useQueuedTxsLength()
  const isSafeAppsEnabled = useHasFeature(FEATURES.SAFE_APPS)

  const enabledNavItems = useMemo(() => {
    return isSafeAppsEnabled ? navItems : navItems.filter((item) => item.href !== AppRoutes.apps.index)
  }, [isSafeAppsEnabled])

  const getBadge = (item: NavItem) => {
    // Indicate whether the current Safe needs an upgrade
    if (item.href === AppRoutes.settings.setup) {
      return safe.implementationVersionState === ImplementationVersionState.OUTDATED
    }
  }

  const getCounter = (item: NavItem) => {
    // Indicate qeueued txs
    if (item.href === AppRoutes.transactions.history) {
      return queueSize
    }
  }

  // Route Transactions to Queue if there are queued txs, otherwise to History
  const getRoute = (href: string) => {
    if (href === AppRoutes.transactions.history && queueSize) {
      return AppRoutes.transactions.queue
    }
    return href
  }

  return (
    <SidebarList>
      {enabledNavItems.map((item) => {
        const isSelected = currentSubdirectory === getSubdirectory(item.href)

        return (
          <ListItem key={item.href} disablePadding selected={isSelected}>
            <SidebarListItemButton
              selected={isSelected}
              href={{ pathname: getRoute(item.href), query: { safe: router.query.safe } }}
            >
              {item.icon && <SidebarListItemIcon badge={getBadge(item)}>{item.icon}</SidebarListItemIcon>}

              <SidebarListItemText data-testid="sidebar-list-item" bold>
                {item.label}

                <SidebarListItemCounter count={getCounter(item)} />
              </SidebarListItemText>
            </SidebarListItemButton>
          </ListItem>
        )
      })}
    </SidebarList>
  )
}

export default React.memo(Navigation)
