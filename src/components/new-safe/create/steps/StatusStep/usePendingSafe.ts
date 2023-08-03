import { useCurrentChain } from '@/hooks/useChains'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { useCallback } from 'react'
import type { PendingSafeByChain, PendingSafeData } from '../../types'

const SAFE_PENDING_CREATION_STORAGE_KEY = 'pendingSafe_v2'

export const usePendingSafe = (): [PendingSafeData | undefined, (safe: PendingSafeData | undefined) => void] => {
  const [pendingSafes, setPendingSafes] = useLocalStorage<PendingSafeByChain>(SAFE_PENDING_CREATION_STORAGE_KEY)

  const chainInfo = useCurrentChain()

  const pendingSafe = chainInfo && pendingSafes?.[chainInfo.chainId]
  const setPendingSafe = useCallback(
    (safe: PendingSafeData | undefined) => {
      if (!chainInfo?.chainId) {
        return
      }

      // Always copy the object because useLocalStorage does not check for deep equality when writing back to ls
      const newPendingSafes = pendingSafes ? { ...pendingSafes } : {}
      newPendingSafes[chainInfo.chainId] = safe
      setPendingSafes(newPendingSafes)
    },
    [chainInfo?.chainId, pendingSafes, setPendingSafes],
  )

  return [pendingSafe, setPendingSafe]
}
