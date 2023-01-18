import { useEffect, useMemo } from 'react'
import { gtmTrack } from '@/services/analytics/gtm'
import { OVERVIEW_EVENTS, TX_LIST_EVENTS, ASSETS_EVENTS } from './events'
import { selectTotalAdded } from '@/store/addedSafesSlice'
import { selectQueuedTransactions } from '@/store/txQueueSlice'
import { useAppSelector } from '@/store'
import useChainId from '@/hooks/useChainId'
import useBalances from '@/hooks/useBalances'
import useSafeInfo from '@/hooks/useSafeInfo'
import useHiddenTokens from '@/hooks/useHiddenTokens'

// Track meta events on app load
const useMetaEvents = (isAnalyticsEnabled: boolean) => {
  const chainId = useChainId()
  const { safeAddress } = useSafeInfo()

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
  const { balances } = useBalances()
  const totalTokens = balances?.items.length || 0
  useEffect(() => {
    if (!isAnalyticsEnabled || !safeAddress || totalTokens <= 0) return

    gtmTrack({ ...ASSETS_EVENTS.DIFFERING_TOKENS, label: totalTokens })
  }, [isAnalyticsEnabled, totalTokens, safeAddress, chainId])

  // Manually hidden tokens
  const hiddenTokens = useHiddenTokens()
  const totalHiddenFromBalance =
    balances?.items.filter((item) => hiddenTokens.includes(item.tokenInfo.address)).length || 0
  useEffect(() => {
    if (!isAnalyticsEnabled || !safeAddress || totalTokens <= 0) return

    gtmTrack({ ...ASSETS_EVENTS.HIDDEN_TOKENS, label: totalHiddenFromBalance })
  }, [isAnalyticsEnabled, safeAddress, totalHiddenFromBalance, totalTokens])
}

export default useMetaEvents
