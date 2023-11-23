import { useContext } from 'react'

import { RecoveryLoaderContext } from '@/components/recovery/RecoveryLoaderContext'

export function useIsRecoveryEnabled(): boolean {
  const [data] = useContext(RecoveryLoaderContext).state
  return !!data && data.length > 0
}
