import { useAppSelector } from '@/store'
import { selectRecovery } from '@/store/recoverySlice'

export function useIsRecoveryEnabled(): boolean {
  const recovery = useAppSelector(selectRecovery)
  return recovery.length === 0
}
