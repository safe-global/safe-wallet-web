import { useCurrentChain } from '@/hooks/useChains'
import { FEATURES, hasFeature } from '@/utils/chains'
import { useAppSelector } from '@/store'
import { selectSpendingLimits } from '@/store/spendingLimitsSlice'
import useWallet from '@/hooks/wallets/useWallet'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'

const useIsOnlySpendingLimitBeneficiary = (): boolean => {
  const currentChain = useCurrentChain()
  const isEnabled = currentChain && hasFeature(currentChain, FEATURES.SPENDING_LIMIT)
  const spendingLimits = useAppSelector(selectSpendingLimits)
  const wallet = useWallet()
  const isSafeOwner = useIsSafeOwner()

  if (isSafeOwner || !isEnabled || spendingLimits.length === 0) {
    return false
  }

  return spendingLimits.some(({ beneficiary }) => beneficiary === wallet?.address)
}

export default useIsOnlySpendingLimitBeneficiary
