import { useMemo } from 'react'
import useChainId from '@/hooks/useChainId'
import { useCurrentChain } from '@/hooks/useChains'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useSafeInfo from '@/hooks/useSafeInfo'
import { getLegacyChainName } from '../utils'

const useGetSafeInfo = () => {
  const { safe, safeAddress } = useSafeInfo()
  const isOwner = useIsSafeOwner()
  const chainId = useChainId()
  const chain = useCurrentChain()
  const chainName = chain?.chainName || ''

  return useMemo(
    () => () => ({
      safeAddress,
      chainId: parseInt(chainId, 10),
      owners: safe.owners.map((owner) => owner.value),
      threshold: safe.threshold,
      isReadOnly: !isOwner,
      nonce: safe.nonce,
      implementation: safe.implementation.value,
      modules: safe.modules ? safe.modules.map((module) => module.value) : null,
      fallbackHandler: safe.fallbackHandler ? safe.fallbackHandler?.value : null,
      guard: safe.guard?.value || null,
      version: safe.version,
      network: getLegacyChainName(chainName || '', chainId).toUpperCase(),
    }),
    [
      chainId,
      chainName,
      isOwner,
      safeAddress,
      safe.owners,
      safe.threshold,
      safe.nonce,
      safe.implementation,
      safe.modules,
      safe.fallbackHandler,
      safe.guard,
      safe.version,
    ],
  )
}

export default useGetSafeInfo
