import type { TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import useWallet from '@/hooks/wallets/useWallet'
import { sameAddress } from '@/utils/addresses'
import useAllSpendingLimits, { type SpendingLimitState } from './useSpendingLimits'

const useSpendingLimit = (selectedToken?: TokenInfo): SpendingLimitState | undefined => {
  const wallet = useWallet()
  const [spendingLimits] = useAllSpendingLimits()

  return spendingLimits?.find(
    (spendingLimit) =>
      sameAddress(spendingLimit.token.address, selectedToken?.address) &&
      sameAddress(spendingLimit.beneficiary, wallet?.address),
  )
}

export default useSpendingLimit
