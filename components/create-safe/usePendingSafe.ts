import useLocalStorage from '@/services/localStorage/useLocalStorage'
import { PendingSafeByChain, PendingSafeData } from '@/components/create-safe/index'
import useChainId from '@/hooks/useChainId'

const SAFE_PENDING_CREATION_STORAGE_KEY = 'pendingSafe'

export const usePendingSafe = (): [PendingSafeData | undefined, (data: PendingSafeData | undefined) => void] => {
  const chainId = useChainId()
  const [pendingSafes, setPendingSafes] = useLocalStorage<PendingSafeByChain | undefined>(
    SAFE_PENDING_CREATION_STORAGE_KEY,
    undefined,
  )

  const pendingSafe = pendingSafes?.[chainId]

  const setPendingSafe = (data: PendingSafeData | undefined) =>
    setPendingSafes((prev) => (prev ? { ...prev, [chainId]: data } : { [chainId]: data }))

  return [pendingSafe, setPendingSafe]
}
