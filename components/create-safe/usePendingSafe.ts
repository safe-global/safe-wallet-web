import useLocalStorage from '@/services/localStorage/useLocalStorage'
import { PendingSafeByChain, PendingSafeData } from '@/components/create-safe/index'
import useChainId from '@/hooks/useChainId'
import { Dispatch, SetStateAction, useCallback } from 'react'

const SAFE_PENDING_CREATION_STORAGE_KEY = 'pendingSafe'

type Prop = PendingSafeData | undefined

export const usePendingSafe = (): [Prop, Dispatch<SetStateAction<Prop>>] => {
  const chainId = useChainId()
  const [pendingSafes, setPendingSafes] = useLocalStorage<PendingSafeByChain | undefined>(
    SAFE_PENDING_CREATION_STORAGE_KEY,
    undefined,
  )

  const pendingSafe = pendingSafes?.[chainId]

  const setPendingSafe = useCallback(
    (data: Prop | ((prevData: Prop) => Prop)) => {
      const newData = data instanceof Function ? data(pendingSafe) : data
      return setPendingSafes((prev) => (prev ? { ...prev, [chainId]: newData } : { [chainId]: newData }))
    },
    [chainId, pendingSafe, setPendingSafes],
  )

  return [pendingSafe, setPendingSafe]
}
