import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { isSmartContractWallet } from '@/hooks/wallets/wallets'
import { hasEnoughSignatures } from '@/utils/transactions'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'

const useWalletCanRelay = (tx: SafeTransaction | undefined) => {
  const { safe } = useSafeInfo()
  const wallet = useWallet()

  return useAsync(() => {
    if (!tx || !wallet) return

    return isSmartContractWallet(wallet)
      .then((isSCWallet) => {
        if (!isSCWallet) return true

        return hasEnoughSignatures(tx, safe)
      })
      .catch((err) => {
        console.error("Couldn't determine if a Smart Contract wallet is connected", err)
        return false
      })
  }, [tx, wallet, safe.threshold])
}

export default useWalletCanRelay
