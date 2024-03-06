import useAsync from '@/hooks/useAsync'
import { checksumAddress } from '@/utils/addresses'
import { getAllOwnedSafes } from '@safe-global/safe-gateway-typescript-sdk'

const useAllOwnedSafes = (address: string) => {
  return useAsync(() => {
    if (!address) return
    return getAllOwnedSafes(checksumAddress(address))
  }, [address])
}

export default useAllOwnedSafes
