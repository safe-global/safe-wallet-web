import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { isSmartContractWallet } from '@/hooks/wallets/wallets'
import { Errors, logError } from '@/services/exceptions'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'

const useWalletCanRelay = (tx: SafeTransaction | undefined) => {
  const { safe } = useSafeInfo()
  const wallet = useWallet()
  const hasEnoughSignatures = tx && tx.signatures.size >= safe.threshold

  return useAsync(() => {
    if (!tx || !wallet) return

    return isSmartContractWallet(wallet)
      .then((isSCWallet) => {
        if (!isSCWallet) return true

        return hasEnoughSignatures
      })
      .catch((err) => {
        logError(Errors._106, err.message)
        return false
      })
  }, [hasEnoughSignatures, wallet, safe.threshold])
}

export default useWalletCanRelay
