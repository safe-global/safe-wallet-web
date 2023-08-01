import { useCallback } from 'react'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'

import { useAppDispatch, useAppSelector } from '@/store'
import { selectOpened, markOpened } from '@/store/safeAppsSlice'

type ReturnType = {
  openedSafeAppIds: Array<SafeAppData['id']>
  markSafeAppOpened: (id: SafeAppData['id']) => void
}

// Return the ids of Safe Apps previously opened by the user
export const useOpenedSafeApps = (): ReturnType => {
  const dispatch = useAppDispatch()
  const openedSafeAppIds = useAppSelector(selectOpened)

  const markSafeAppOpened = useCallback(
    (id: SafeAppData['id']) => {
      dispatch(markOpened({ id }))
    },
    [dispatch],
  )

  return { openedSafeAppIds, markSafeAppOpened }
}
