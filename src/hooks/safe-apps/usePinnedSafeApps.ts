import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectPinned, setPinned } from '@/store/safeAppsSlice'
import useChainId from '../useChainId'

type ReturnType = {
  pinnedSafeAppIds: Set<number>
  updatePinnedSafeApps: (newPinnedSafeAppIds: Set<number>) => void
}

// Return the pinned app ids across all chains
export const usePinnedSafeApps = (): ReturnType => {
  const chainId = useChainId()
  const pinned = useAppSelector((state) => selectPinned(state, chainId))
  const pinnedSafeAppIds = useMemo(() => new Set(pinned), [pinned])
  const dispatch = useAppDispatch()

  const updatePinnedSafeApps = useCallback(
    (ids: Set<number>) => {
      dispatch(setPinned({ pinned: Array.from(ids), chainId }))
    },
    [dispatch, chainId],
  )

  return { pinnedSafeAppIds, updatePinnedSafeApps }
}
