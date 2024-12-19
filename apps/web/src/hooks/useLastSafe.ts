import { useAppSelector } from '@/store'
import { selectLastSafeAddress } from '@/store/sessionSlice'
import { useCurrentChain } from './useChains'

const useLastSafe = (): string | undefined => {
  const chainInfo = useCurrentChain()
  const chainId = chainInfo?.chainId || ''
  const prefix = chainInfo?.shortName || ''
  const lastSafeAddress = useAppSelector((state) => selectLastSafeAddress(state, chainId))
  return prefix && lastSafeAddress ? `${prefix}:${lastSafeAddress}` : undefined
}

export default useLastSafe
