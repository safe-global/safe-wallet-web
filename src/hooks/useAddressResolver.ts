import useAddressBook from '@/hooks/useAddressBook'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { lookupAddress } from '@/services/domains'
import { hasFeature } from '@/utils/chains'
import { FEATURES } from '@gnosis.pm/safe-react-gateway-sdk'
import { useMemo } from 'react'
import { useCurrentChain } from './useChains'
import useAsync from '@/hooks/useAsync'
import useDebounce from './useDebounce'
import { getRandomName } from './useMnemonicName'

export const useAddressResolver = (address: string, fallback = getRandomName()) => {
  const addressBook = useAddressBook()
  const ethersProvider = useWeb3ReadOnly()
  const debouncedValue = useDebounce(address, 200)
  const addressBookName = addressBook[address]
  const currentChain = useCurrentChain()
  const isDomainLookupEnabled = !!currentChain && hasFeature(currentChain, FEATURES.DOMAIN_LOOKUP)
  const shouldResolve = !addressBookName && isDomainLookupEnabled && !!ethersProvider && !!debouncedValue

  const [ensName, _, isResolving] = useAsync<string | undefined>(async () => {
    if (!shouldResolve) return
    return lookupAddress(ethersProvider, debouncedValue)
  }, [ethersProvider, debouncedValue, shouldResolve])

  const resolving = shouldResolve && isResolving
  const name = addressBookName || ensName || (resolving ? '' : fallback)

  return useMemo(
    () => ({
      name,
      resolving,
    }),
    [name, resolving],
  )
}
