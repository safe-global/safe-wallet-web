import { useMemo } from 'react'
import useChainId from '@/hooks/useChainId'
import { useCurrentChain } from '@/hooks/useChains'
import useIsGranted from '@/hooks/useIsGranted'
import useSafeInfo from '@/hooks/useSafeInfo'
import { getLegacyChainName } from '../utils'

const useGetSafeInfo = () => {
  const { safe, safeAddress } = useSafeInfo()
  const granted = useIsGranted()
  const chainId = useChainId()
  const chain = useCurrentChain()
  const chainName = chain?.chainName || ''

  return useMemo(
    () => () => ({
      safeAddress,
      chainId: parseInt(chainId, 10),
      owners: safe.owners.map((owner) => owner.value),
      threshold: safe.threshold,
      isReadOnly: !granted,
      network: getLegacyChainName(chainName || '', chainId).toUpperCase(),
    }),
    [chainId, chainName, granted, safeAddress, safe.owners, safe.threshold],
  )
}

export default useGetSafeInfo
