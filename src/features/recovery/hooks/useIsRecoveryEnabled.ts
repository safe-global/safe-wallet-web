import { useRecovery } from '@/features/recovery/components/RecoveryContext'

export function useIsRecoveryEnabled(): boolean {
  const [recovery] = useRecovery()
  return !!recovery && recovery.length > 0
}
