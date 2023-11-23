import { selectDelayModifierByGuardian } from '@/services/recovery/selectors'
import useWallet from './wallets/useWallet'
import { useRecovery } from '@/components/recovery/RecoveryContext'

export function useIsGuardian() {
  const [recovery] = useRecovery()
  const wallet = useWallet()
  return Boolean(wallet?.address && recovery && selectDelayModifierByGuardian(recovery, wallet.address))
}
