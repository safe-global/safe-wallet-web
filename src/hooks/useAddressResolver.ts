import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { lookupAddress } from '@/services/ens'
import { FEATURES, hasFeature } from '@/utils/chains'
import { useMemo } from 'react'
import useAsync from '@/hooks/useAsync'
import useDebounce from './useDebounce'
import { useChain } from './useChains'
import useChainId from './useChainId'
import useAllAddressBooks from '@/hooks/useAllAddressBooks'

export const useAddressResolver = (address?: string, chainId?: string) => {
  const ethersProvider = useWeb3ReadOnly()
  const debouncedValue = useDebounce(address, 200)
  const currentChainId = useChainId()
  const chain = useChain(chainId ?? currentChainId)
  const isDomainLookupEnabled = chain && hasFeature(chain, FEATURES.DOMAIN_LOOKUP)
  const addressBook = useAllAddressBooks()[chainId ?? currentChainId] || {}
  const shouldResolve = isDomainLookupEnabled && !!ethersProvider && !!address && !addressBook[address]

  const [ens, _, isResolving] = useAsync<string | undefined>(() => {
    if (!shouldResolve) return
    return lookupAddress(ethersProvider, debouncedValue || '')
  }, [ethersProvider, debouncedValue, shouldResolve])

  const resolving = shouldResolve && isResolving
  const name = addressBook[address || '']

  return useMemo(
    () => ({
      name,
      ens,
      resolving,
    }),
    [name, ens, resolving],
  )
}
