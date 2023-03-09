import useIsSmartContractWallet from '@/hooks/useIsSmartContractWallet'
import useSafeInfo from '@/hooks/useSafeInfo'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'

const useWalletCanRelay = (tx: SafeTransaction | undefined) => {
  const [isSCWallet, , loadingWalletType] = useIsSmartContractWallet()
  const { safe } = useSafeInfo()

  if (!tx || loadingWalletType) return false

  const hasEnoughSignatures = tx.signatures.size >= safe.threshold

  return !isSCWallet || (isSCWallet && hasEnoughSignatures)
}

export default useWalletCanRelay
