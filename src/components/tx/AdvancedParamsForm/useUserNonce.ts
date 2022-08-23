import useAsync from '@/hooks/useAsync'
import useWallet from '@/hooks/wallets/useWallet'
import { getUserNonce } from '@/hooks/wallets/web3'

export default function useUserNonce() {
  const wallet = useWallet()
  const [userNonce] = useAsync<number>(() => {
    if (!wallet) return
    return getUserNonce(wallet.address)
  }, [wallet])
  return userNonce
}
