import useChainId from '@/hooks/useChainId'
import { useAppSelector } from '@/store'
import { selectLastSafeAddress } from '@/store/sessionSlice'
import chains from '@/config/chains'

const useLastSafe = (): string | undefined => {
  const chainId = useChainId()
  const lastSafeAddress = useAppSelector((state) => selectLastSafeAddress(state, chainId))
  const prefix = Object.keys(chains).find((prefix) => chains[prefix] === chainId)
  return prefix && lastSafeAddress ? `${prefix}:${lastSafeAddress}` : undefined
}

export { useLastSafe }
