import useLocalStorage from '@/services/localStorage/useLocalStorage'
import { PendingSafeData, SAFE_PENDING_CREATION_STORAGE_KEY } from '@/components/create-safe/index'

export const usePendingSafe = () => {
  return useLocalStorage<PendingSafeData | undefined>(SAFE_PENDING_CREATION_STORAGE_KEY, undefined)
}
