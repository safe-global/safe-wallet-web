import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { PendingSafeByChain, PendingSafeData } from '@/components/create-safe/index'
import useChainId from '@/hooks/useChainId'
import { Dispatch, SetStateAction, useCallback } from 'react'

const SAFE_PENDING_CREATION_STORAGE_KEY = 'pendingSafe'

type Props = PendingSafeData | undefined

export const usePendingSafe = (): [Props, Dispatch<SetStateAction<Props>>] => {
  const chainId = useChainId()
  const [pendingSafes, setPendingSafes] = useLocalStorage<PendingSafeByChain | undefined>(
    SAFE_PENDING_CREATION_STORAGE_KEY,
    undefined,
  )

  const pendingSafe = pendingSafes?.[chainId]

  const setPendingSafe = useCallback(
    (data: Props | ((prevData: Props) => Props)) => {
      const newData = data instanceof Function ? data(pendingSafe) : data
      return setPendingSafes((prev) => (prev ? { ...prev, [chainId]: newData } : { [chainId]: newData }))
    },
    [chainId, pendingSafe, setPendingSafes],
  )

  return [pendingSafe, setPendingSafe]
}
