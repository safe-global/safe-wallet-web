import useWallet from '@/hooks/wallets/useWallet'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import { useSafeHasSpendingLimits, useSpendingLimitDelegates } from './useSpendingLimits'

const useIsOnlySpendingLimitBeneficiary = (allow = false): boolean => {
  const hasSpendingLimits = useSafeHasSpendingLimits()
  const wallet = useWallet()
  const isSafeOwner = useIsSafeOwner()
  const canHaveSpendingLimit = Boolean(allow && hasSpendingLimits && wallet && !isSafeOwner)
  const [delegates] = useSpendingLimitDelegates(canHaveSpendingLimit)

  if (!canHaveSpendingLimit) return false

  return delegates?.some((beneficiary) => beneficiary === wallet?.address) ?? false
}

export default useIsOnlySpendingLimitBeneficiary
