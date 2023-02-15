import useAddressBook from '@/hooks/useAddressBook'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { lookupAddress } from '@/services/ens'
import { FEATURES, hasFeature } from '@/utils/chains'
import { useMemo } from 'react'
import { useCurrentChain } from './useChains'
import useAsync from '@/hooks/useAsync'
import useDebounce from './useDebounce'

export const useAddressResolver = (address: string) => {
  const addressBook = useAddressBook()
  const ethersProvider = useWeb3ReadOnly()
  const debouncedValue = useDebounce(address, 200)
  const addressBookName = addressBook[address]
  const currentChain = useCurrentChain()
  const isDomainLookupEnabled = !!currentChain && hasFeature(currentChain, FEATURES.DOMAIN_LOOKUP)
  const shouldResolve = !addressBookName && isDomainLookupEnabled && !!ethersProvider && !!debouncedValue

  const [ens, _, isResolving] = useAsync<string | undefined>(() => {
    if (!shouldResolve) return
    return lookupAddress(ethersProvider, debouncedValue)
  }, [ethersProvider, debouncedValue, shouldResolve])

  const resolving = shouldResolve && isResolving

  return useMemo(
    () => ({
      ens,
      name: addressBookName,
      resolving,
    }),
    [ens, addressBookName, resolving],
  )
}
