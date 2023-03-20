import useAsync from '@/hooks/useAsync'
import useWallet from '@/hooks/wallets/useWallet'
import { isHardwareWallet, WALLET_KEYS, isSmartContractWallet } from '@/hooks/wallets/wallets'

export const useShouldManuallySwitchChain = () => {
  const wallet = useWallet()

  return useAsync(async () => {
    if (!wallet) {
      return true
    }

    if (isHardwareWallet(wallet)) {
      return true
    }

    if (wallet.label.toUpperCase() === WALLET_KEYS.WALLETCONNECT) {
      return isSmartContractWallet(wallet)
    }

    return false
  }, [wallet])
}
