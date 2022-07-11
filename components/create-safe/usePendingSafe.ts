import useLocalStorage from '@/services/localStorage/useLocalStorage'
import { PendingSafeData } from '@/components/create-safe/index'

const SAFE_PENDING_CREATION_STORAGE_KEY = 'pendingSafe'

export const usePendingSafe = () => {
  return useLocalStorage<PendingSafeData | undefined>(SAFE_PENDING_CREATION_STORAGE_KEY, undefined)
}
