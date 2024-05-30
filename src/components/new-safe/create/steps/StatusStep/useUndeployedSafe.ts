import { selectUndeployedSafes } from '@/features/counterfactual/store/undeployedSafesSlice'
import useChainId from '@/hooks/useChainId'
import { useAppSelector } from '@/store'

// Returns the undeployed safe for the current network that is PROCESSING
// This is not bulletproof as there can be two safes at the same time that are PROCESSING
// e.g. Create Counterfactual safe and deploy, go back to safe creation and create and deploy another safe
const useUndeployedSafe = () => {
  const chainId = useChainId()
  const undeployedSafes = useAppSelector(selectUndeployedSafes)
  const undeployedSafe =
    undeployedSafes[chainId] &&
    Object.entries(undeployedSafes[chainId]).find((undeployedSafe) => {
      return undeployedSafe[1].status.status === 'PROCESSING'
    })

  return undeployedSafe || []
}

export default useUndeployedSafe
