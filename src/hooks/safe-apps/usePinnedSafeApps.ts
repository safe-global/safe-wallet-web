import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectPinned, setPinned } from '@/store/safeAppsSlice'

type ReturnType = {
  pinnedSafeAppIds: Set<number>
  updatePinnedSafeApps: (newPinnedSafeAppIds: Set<number>) => void
}

// Return the pinned app ids across all chains
export const usePinnedSafeApps = (): ReturnType => {
  const pinned = useAppSelector(selectPinned)
  const pinnedSafeAppIds = useMemo(() => new Set(pinned), [pinned])
  const dispatch = useAppDispatch()

  const updatePinnedSafeApps = useCallback(
    (pinned: Set<number>) => {
      dispatch(setPinned(Array.from(pinned)))
    },
    [dispatch],
  )

  return { pinnedSafeAppIds, updatePinnedSafeApps }
}
