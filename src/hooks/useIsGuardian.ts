import { useAppSelector } from '@/store'
import { selectDelayModifierByGuardian } from '@/store/recoverySlice'
import useWallet from './wallets/useWallet'

export function useIsGuardian() {
  const wallet = useWallet()
  return !!useAppSelector((state) => selectDelayModifierByGuardian(state, wallet?.address ?? ''))
}
