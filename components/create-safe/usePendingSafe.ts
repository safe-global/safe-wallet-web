import useLocalStorage from '@/services/localStorage/useLocalStorage'
import { PendingSafeByChain } from '@/components/create-safe/index'

const SAFE_PENDING_CREATION_STORAGE_KEY = 'pendingSafe'

export const usePendingSafe = () => {
  return useLocalStorage<PendingSafeByChain | undefined>(SAFE_PENDING_CREATION_STORAGE_KEY, undefined)
}
