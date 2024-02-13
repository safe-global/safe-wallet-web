import { selectIsUndeployedSafe } from '@/features/counterfactual/store/undeployedSafesSlice'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useAppSelector } from '@/store'

const useIsCounterfactualSafe = () => {
  const chainId = useChainId()
  const { safeAddress } = useSafeInfo()
  return useAppSelector((state) => selectIsUndeployedSafe(state, chainId, safeAddress))
}

export default useIsCounterfactualSafe
