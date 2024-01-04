import useRecovery from '@/features/recovery/hooks/useRecovery'

export function useIsRecoveryEnabled(): boolean {
  const [recovery] = useRecovery()
  return !!recovery && recovery.length > 0
}
