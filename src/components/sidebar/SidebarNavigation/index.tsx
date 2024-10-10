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
import { STAKE_EVENTS, STAKE_LABELS } from '@/services/analytics/events/stake'

const getSubdirectory = (pathname: string): string => {
  return pathname.split('/')[1]
}

const geoBlockedRoutes = [AppRoutes.swap, AppRoutes.stake]

const customSidebarEvents: { [key: string]: { event: any; label: string } } = {
  [AppRoutes.swap]: { event: SWAP_EVENTS.OPEN_SWAPS, label: SWAP_LABELS.sidebar },
  [AppRoutes.stake]: { event: STAKE_EVENTS.OPEN_STAKE, label: STAKE_LABELS.sidebar },
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
      if (isBlockedCountry && geoBlockedRoutes.includes(item.href)) {
        return false
      }

      return isRouteEnabled(item.href, chain)
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
    const eventInfo = customSidebarEvents[href]
    if (eventInfo) {
      trackEvent({ ...eventInfo.event, label: eventInfo.label })
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
            disablePadding
            selected={isSelected}
            onClick={() => handleNavigationClick(item.href)}
            key={item.href}
          >
            <SidebarListItemButton
              selected={isSelected}
              href={item.href && { pathname: getRoute(item.href), query: { safe: router.query.safe } }}
              disabled={item.disabled}
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
