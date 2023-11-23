import { useContext } from 'react'

import { selectDelayModifierByGuardian } from '@/services/recovery/selectors'
import useWallet from './wallets/useWallet'
import { RecoveryLoaderContext } from '@/components/recovery/RecoveryLoaderContext'

export function useIsGuardian() {
  const [data] = useContext(RecoveryLoaderContext).state
  const wallet = useWallet()
  return !wallet?.address || !data || !selectDelayModifierByGuardian(data, wallet.address)
}
