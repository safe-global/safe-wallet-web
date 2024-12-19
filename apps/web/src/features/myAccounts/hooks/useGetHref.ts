import { AppRoutes } from '@/config/routes'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { type NextRouter } from 'next/router'
import { useCallback } from 'react'

/**
 * Navigate to the dashboard when selecting a safe on the welcome page,
 * navigate to the history when selecting a safe on a single tx page,
 * otherwise keep the current route
 */
export const useGetHref = (router: NextRouter) => {
  const isWelcomePage = router.pathname === AppRoutes.welcome.accounts
  const isSingleTxPage = router.pathname === AppRoutes.transactions.tx

  return useCallback(
    (chain: ChainInfo, address: string) => {
      return {
        pathname: isWelcomePage ? AppRoutes.home : isSingleTxPage ? AppRoutes.transactions.history : router.pathname,
        query: { ...router.query, safe: `${chain.shortName}:${address}` },
      }
    },
    [isSingleTxPage, isWelcomePage, router.pathname, router.query],
  )
}
