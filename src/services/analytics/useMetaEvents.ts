import { useEffect, useMemo } from 'react'
import { gtmTrack } from '@/services/analytics/gtm'
import { OVERVIEW_EVENTS, TX_LIST_EVENTS, ASSETS_EVENTS } from './events'
import { selectTotalAdded } from '@/store/addedSafesSlice'
import useSafeAddress from '@/hooks/useSafeAddress'
import { selectQueuedTransactions } from '@/store/txQueueSlice'
import { useAppSelector } from '@/store'
import useChainId from '@/hooks/useChainId'
import useBalances from '@/hooks/useBalances'

// Track meta events on app load
const useMetaEvents = (isAnalyticsEnabled: boolean) => {
  const chainId = useChainId()
  const safeAddress = useSafeAddress()

  // Total added safes
  const totalAddedSafes = useAppSelector(selectTotalAdded)
  useEffect(() => {
    if (!isAnalyticsEnabled || totalAddedSafes === 0) return

    gtmTrack({
      ...OVERVIEW_EVENTS.TOTAL_ADDED_SAFES,
      label: totalAddedSafes.toString(),
    })
  }, [isAnalyticsEnabled, totalAddedSafes])

  // Queue size
  const queue = useAppSelector(selectQueuedTransactions)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const safeQueue = useMemo(() => queue, [safeAddress, queue !== undefined])
  useEffect(() => {
    if (!isAnalyticsEnabled || !safeQueue) return

    gtmTrack({
      ...TX_LIST_EVENTS.QUEUED_TXS,
      label: safeQueue.length.toString(),
    })
  }, [isAnalyticsEnabled, safeQueue])

  // Tokens
  const { balances, loading } = useBalances()
  const totalTokens = loading ? undefined : balances?.items.length
  useEffect(() => {
    if (!isAnalyticsEnabled || !safeAddress || totalTokens === undefined) return

    gtmTrack({ ...ASSETS_EVENTS.DIFFERING_TOKENS, label: totalTokens })
  }, [isAnalyticsEnabled, totalTokens, safeAddress, chainId])
}

export default useMetaEvents
