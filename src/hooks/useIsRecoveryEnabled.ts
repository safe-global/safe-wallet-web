import { useRecovery } from '@/components/recovery/RecoveryContext'

export function useIsRecoveryEnabled(): boolean {
  const [recovery] = useRecovery()
  return !!recovery && recovery.length > 0
}
