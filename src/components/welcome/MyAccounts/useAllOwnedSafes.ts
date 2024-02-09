import { getAllOwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync from '@/hooks/useAsync'
import useWallet from '@/hooks/wallets/useWallet'

const useAllOwnedSafes = () => {
  const { address = '' } = useWallet() || {}

  return useAsync(() => {
    if (!address) return
    return getAllOwnedSafes(address)
  }, [address])
}

export default useAllOwnedSafes
