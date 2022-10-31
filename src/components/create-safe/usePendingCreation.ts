import useLocalStorage from '@/services/local-storage/useLocalStorage'
import type { PendingSafeData } from './types'

const SAFE_PENDING_CREATION_STORAGE_KEY = 'pendingSafe'

const usePendingCreation = () => {
  return useLocalStorage<PendingSafeData | undefined>(SAFE_PENDING_CREATION_STORAGE_KEY)
}

export default usePendingCreation
