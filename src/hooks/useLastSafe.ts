import useChainId from '@/hooks/useChainId'
import { useAppSelector } from '@/store'
import { selectLastSafeAddress } from '@/store/sessionSlice'
import { getShortName } from '@/utils/chains'

const useLastSafe = (): string | undefined => {
  const chainId = useChainId()
  const lastSafeAddress = useAppSelector((state) => selectLastSafeAddress(state, chainId))
  const prefix = getShortName(chainId)
  return prefix && lastSafeAddress ? `${prefix}:${lastSafeAddress}` : undefined
}

export default useLastSafe
