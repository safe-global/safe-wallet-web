import useAddressBook from '@/hooks/useAddressBook'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { lookupAddress } from '@/services/domains'
import { parsePrefixedAddress } from '@/utils/addresses'
import { hasFeature } from '@/utils/chains'
import { FEATURES } from '@gnosis.pm/safe-react-gateway-sdk'
import { useCallback } from 'react'
import { useCurrentChain } from './useChains'
import useAsync from '@/hooks/useAsync'

export const useAddressResolver = (address: string) => {
  const chainInfo = useCurrentChain()
  const addressBook = useAddressBook()
  const ethersProvider = useWeb3ReadOnly()

  const lookupOwnerAddress = useCallback(
    async (ownerAddress: string) => {
      if (ownerAddress === '') {
        return
      }

      const { address } = parsePrefixedAddress(ownerAddress)

      const nameFromAddressBook = addressBook[address]
      if (nameFromAddressBook) {
        return nameFromAddressBook
      }

      if (!ethersProvider || !chainInfo || !hasFeature(chainInfo, FEATURES.DOMAIN_LOOKUP)) {
        return
      }

      const ensName = await lookupAddress(ethersProvider, address)
      if (ensName) {
        return ensName
      }
    },
    [addressBook, chainInfo, ethersProvider],
  )

  const [name, _, resolving] = useAsync<string | undefined>(() => {
    return lookupOwnerAddress(address)
  }, [lookupOwnerAddress, address])

  return {
    name,
    resolving,
  }
}
