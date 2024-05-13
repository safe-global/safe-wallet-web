import React, { useMemo, type ReactElement } from 'react'
import { useRouter } from 'next/router'
import ListItem from '@mui/material/ListItem'
import { type ChainInfo, ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'

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
import { FeatureRoutes, hasFeature } from '@/utils/chains'
import { trackEvent } from '@/services/analytics'
import { SWAP_EVENTS, SWAP_LABELS } from '@/services/analytics/events/swaps'
import useIsCounterfactualSafe from '@/features/counterfactual/hooks/useIsCounterfactualSafe'

const getSubdirectory = (pathname: string): string => {
  return pathname.split('/')[1]
}

const isRouteEnabled = (route: string, chain?: ChainInfo) => {
  if (!chain) return false

  const featureRoute = FeatureRoutes[route]
  return !featureRoute || hasFeature(chain, featureRoute)
}

const Navigation = (): ReactElement => {
  const chain = useCurrentChain()
  const router = useRouter()
  const { safe } = useSafeInfo()
  const currentSubdirectory = getSubdirectory(router.pathname)
  const queueSize = useQueuedTxsLength()
  const isCounterFactualSafe = useIsCounterfactualSafe()
  const enabledNavItems = useMemo(() => {
    return navItems.filter((item) => {
      const enabled = isRouteEnabled(item.href, chain)

      if (item.href === AppRoutes.swap && isCounterFactualSafe) {
        return false
      }
      return enabled
    })
  }, [chain, isCounterFactualSafe])

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

  const handleNavigationClick = (href: string) => {
    if (href === AppRoutes.swap) {
      trackEvent({ ...SWAP_EVENTS.OPEN_SWAPS, label: SWAP_LABELS.sidebar })
    }
  }

  return (
    <SidebarList>
      {enabledNavItems.map((item) => {
        const isSelected = currentSubdirectory === getSubdirectory(item.href)

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
