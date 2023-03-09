import useAsync from '@/hooks/useAsync'
import useWallet from '@/hooks/wallets/useWallet'
import { isSmartContractWallet } from '@/hooks/wallets/wallets'

const useIsSmartContractWallet = () => {
  const wallet = useWallet()

  return useAsync(() => {
    if (!wallet) return

    return isSmartContractWallet(wallet)
  }, [wallet])
}

export default useIsSmartContractWallet
