import useAddressBook from '@/hooks/useAddressBook'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { lookupAddress } from '@/services/domains'
import { hasFeature } from '@/utils/chains'
import { FEATURES } from '@gnosis.pm/safe-react-gateway-sdk'
import { useCallback, useMemo } from 'react'
import { useCurrentChain } from './useChains'
import useAsync from '@/hooks/useAsync'
import useDebounce from './useDebounce'

export const useAddressResolver = (address: string) => {
  const chainInfo = useCurrentChain()
  const addressBook = useAddressBook()
  const ethersProvider = useWeb3ReadOnly()
  const debouncedValue = useDebounce(address, 200)

  const lookupOwnerAddress = useCallback(
    async (ownerAddress: string) => {
      if (ownerAddress === '') {
        return
      }

      const nameFromAddressBook = addressBook[ownerAddress]
      if (nameFromAddressBook) {
        return nameFromAddressBook
      }

      if (!ethersProvider || !chainInfo || !hasFeature(chainInfo, FEATURES.DOMAIN_LOOKUP)) {
        return
      }

      const ensName = await lookupAddress(ethersProvider, ownerAddress)
      if (ensName) {
        return ensName
      }
    },
    [addressBook, chainInfo, ethersProvider],
  )

  const [name, _, isResolving] = useAsync<string | undefined>(() => {
    return lookupOwnerAddress(debouncedValue)
  }, [lookupOwnerAddress, debouncedValue])

  const resolving = isResolving && !!ethersProvider && !!debouncedValue

  return useMemo(
    () => ({
      name,
      resolving,
    }),
    [name, resolving],
  )
}
