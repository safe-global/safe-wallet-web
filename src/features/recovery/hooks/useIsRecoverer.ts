import { selectDelayModifierByRecoverer } from '@/features/recovery/services/selectors'
import useWallet from '@/hooks/wallets/useWallet'
import { useRecovery } from '@/features/recovery/components/RecoveryContext'

export function useIsRecoverer() {
  const [recovery] = useRecovery()
  const wallet = useWallet()
  return Boolean(wallet?.address && recovery && selectDelayModifierByRecoverer(recovery, wallet.address))
}
