import { getAllOwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync from '@/hooks/useAsync'

const useAllOwnedSafes = (address: string) => {
  return useAsync(() => {
    if (!address) return
    return getAllOwnedSafes(address)
  }, [address])
}

export default useAllOwnedSafes
