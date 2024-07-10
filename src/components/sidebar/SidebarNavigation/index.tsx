import React, { useContext, useMemo, type ReactElement } from 'react'
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
import { useCurrentChain } from '@/hooks/useChains'
import { isRouteEnabled } from '@/utils/chains'
import { trackEvent } from '@/services/analytics'
import { SWAP_EVENTS, SWAP_LABELS } from '@/services/analytics/events/swaps'
import { GeoblockingContext } from '@/components/common/GeoblockingProvider'

const getSubdirectory = (pathname: string): string => {
  return pathname.split('/')[1]
}

const Navigation = (): ReactElement => {
  const chain = useCurrentChain()
  const router = useRouter()
  const { safe } = useSafeInfo()
  const currentSubdirectory = getSubdirectory(router.pathname)
  const queueSize = useQueuedTxsLength()
  const isBlockedCountry = useContext(GeoblockingContext)
  const enabledNavItems = useMemo(() => {
    return navItems.filter((item) => {
      const enabled = isRouteEnabled(item.href, chain)

      if (item.href === AppRoutes.swap && isBlockedCountry) {
        return false
      }
      return enabled
    })
  }, [chain, isBlockedCountry])

  const getBadge = (item: NavItem) => {
    // Indicate whether the current Safe needs an upgrade
    if (item.href === AppRoutes.settings.setup) {
      return safe.implementationVersionState === ImplementationVersionState.OUTDATED
    }
  }

  // Route Transactions to Queue if there are queued txs, otherwise to History
  const getRoute = (href: string) => {
    if (href === AppRoutes.transactions.history && queueSize) {
      return AppRoutes.transactions.queue
    }
    return href
  }

  const handleNavigationClick = (href: string) => {
    if (href === AppRoutes.swap) {
      trackEvent({ ...SWAP_EVENTS.OPEN_SWAPS, label: SWAP_LABELS.sidebar })
    }
  }

  return (
    <SidebarList>
      {enabledNavItems.map((item) => {
        const isSelected = currentSubdirectory === getSubdirectory(item.href)

        let ItemTag = item.tag ? item.tag : null

        if (item.href === AppRoutes.transactions.history) {
          ItemTag = queueSize ? <SidebarListItemCounter count={queueSize} /> : null
        }

        return (
          <ListItem
            key={item.href}
            disablePadding
            selected={isSelected}
            onClick={() => handleNavigationClick(item.href)}
          >
            <SidebarListItemButton
              selected={isSelected}
              href={{ pathname: getRoute(item.href), query: { safe: router.query.safe } }}
            >
              {item.icon && <SidebarListItemIcon badge={getBadge(item)}>{item.icon}</SidebarListItemIcon>}

              <SidebarListItemText data-testid="sidebar-list-item" bold>
                {item.label}

                {ItemTag}
              </SidebarListItemText>
            </SidebarListItemButton>
          </ListItem>
        )
      })}
    </SidebarList>
  )
}

export default React.memo(Navigation)
