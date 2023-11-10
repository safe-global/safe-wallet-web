import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { isSmartContractWallet } from '@/utils/wallets'
import { Errors, logError } from '@/services/exceptions'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { FEATURES, hasFeature } from '@/utils/chains'
import { useCurrentChain } from './useChains'

const useWalletCanRelay = (tx: SafeTransaction | undefined) => {
  const { safe } = useSafeInfo()
  const wallet = useWallet()
  const chain = useCurrentChain()
  const isFeatureEnabled = chain && hasFeature(chain, FEATURES.RELAYING)
  const hasEnoughSignatures = tx && tx.signatures.size >= safe.threshold

  return useAsync(() => {
    if (!isFeatureEnabled || !tx || !wallet) return

    return isSmartContractWallet(wallet)
      .then((isSCWallet) => {
        if (!isSCWallet) return true

        return hasEnoughSignatures
      })
      .catch((err) => {
        logError(Errors._106, err.message)
        return false
      })
  }, [isFeatureEnabled, hasEnoughSignatures, tx, wallet])
}

export default useWalletCanRelay
