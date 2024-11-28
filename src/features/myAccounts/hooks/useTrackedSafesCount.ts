import { AppRoutes } from '@/config/routes'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'
import type { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { type SafeItem } from './useAllSafes'
import type { AllSafesGrouped } from './useAllSafesGrouped'
import { type MultiChainSafeItem } from './useAllSafesGrouped'
import { isMultiChainSafeItem } from '@/features/multichain/utils/utils'

let isOwnedSafesTracked = false
let isPinnedSafesTracked = false
let isWatchlistTracked = false

const useTrackSafesCount = (
  safes: AllSafesGrouped,
  pinnedSafes: (MultiChainSafeItem | SafeItem)[],
  wallet: ConnectedWallet | null,
) => {
  const router = useRouter()
  const isLoginPage = router.pathname === AppRoutes.welcome.accounts

  const ownedMultiChainSafes = useMemo(
    () => safes.allMultiChainSafes?.filter((account) => account.safes.some(({ isReadOnly }) => !isReadOnly)),
    [safes],
  )

  // If all safes of a multichain account are on the watchlist we put the entire account on the watchlist
  const watchlistMultiChainSafes = useMemo(
    () =>
      safes.allMultiChainSafes?.filter((account) =>
        account.safes.some(({ isReadOnly, isPinned }) => isReadOnly && !isPinned),
      ),
    [safes],
  )

  const ownedSafes = useMemo<(MultiChainSafeItem | SafeItem)[]>(
    () => [...(ownedMultiChainSafes ?? []), ...(safes.allSingleSafes?.filter(({ isReadOnly }) => !isReadOnly) ?? [])],
    [safes, ownedMultiChainSafes],
  )
  const watchlistSafes = useMemo<(MultiChainSafeItem | SafeItem)[]>(
    () => [
      ...(watchlistMultiChainSafes ?? []),
      ...(safes.allSingleSafes?.filter(({ isReadOnly, isPinned }) => isReadOnly && !isPinned) ?? []),
    ],
    [safes, watchlistMultiChainSafes],
  )

  // Reset tracking for new wallet
  useEffect(() => {
    isOwnedSafesTracked = false
  }, [wallet?.address])

  useEffect(() => {
    const totalSafesOwned = ownedSafes?.reduce(
      (prev, current) => prev + (isMultiChainSafeItem(current) ? current.safes.length : 1),
      0,
    )
    if (wallet && !isOwnedSafesTracked && ownedSafes && ownedSafes.length > 0 && isLoginPage) {
      trackEvent({ ...OVERVIEW_EVENTS.TOTAL_SAFES_OWNED, label: totalSafesOwned })
      isOwnedSafesTracked = true
    }
  }, [isLoginPage, ownedSafes, wallet])

  useEffect(() => {
    const totalSafesPinned = pinnedSafes?.reduce(
      (prev, current) => prev + (isMultiChainSafeItem(current) ? current.safes.length : 1),
      0,
    )
    if (!isPinnedSafesTracked && pinnedSafes && pinnedSafes.length > 0 && isLoginPage) {
      trackEvent({ ...OVERVIEW_EVENTS.TOTAL_SAFES_PINNED, label: totalSafesPinned })
      isPinnedSafesTracked = true
    }
  }, [isLoginPage, pinnedSafes])

  useEffect(() => {
    const totalSafesWatched = watchlistSafes?.reduce(
      (prev, current) => prev + (isMultiChainSafeItem(current) ? current.safes.length : 1),
      0,
    )
    if (watchlistSafes && isLoginPage && watchlistSafes.length > 0 && !isWatchlistTracked) {
      trackEvent({ ...OVERVIEW_EVENTS.TOTAL_SAFES_WATCHLIST, label: totalSafesWatched })
      isWatchlistTracked = true
    }
  }, [isLoginPage, watchlistSafes])
}

export default useTrackSafesCount
