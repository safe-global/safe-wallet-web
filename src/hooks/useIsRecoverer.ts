import { selectDelayModifierByRecoverer } from '@/services/recovery/selectors'
import useWallet from './wallets/useWallet'
import { useRecovery } from '@/components/recovery/RecoveryContext'

export function useIsRecoverer() {
  const [recovery] = useRecovery()
  const wallet = useWallet()
  return Boolean(wallet?.address && recovery && selectDelayModifierByRecoverer(recovery, wallet.address))
}
