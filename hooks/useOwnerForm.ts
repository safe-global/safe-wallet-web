import { Owner } from '@/components/create-safe'
import useAddressBook from '@/hooks/useAddressBook'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { lookupAddress } from '@/services/domains'
import { parsePrefixedAddress } from '@/utils/addresses'
import { hasFeature } from '@/utils/chains'
import { FEATURES } from '@gnosis.pm/safe-react-gateway-sdk'
import { useCallback, useEffect } from 'react'
import { useCurrentChain } from './useChains'

const createOwnerSignature = (ownerValue: Owner[]) => ownerValue.map((owner) => owner.address).join('')

export const useOwnerForm = (
  ownerValues: Owner[] | undefined,
  update: (fieldNameSuffix: `${number}.resolving` | `${number}.name`, value: string | boolean) => void,
) => {
  const chainInfo = useCurrentChain()
  const addressBook = useAddressBook()
  const ethersProvider = useWeb3ReadOnly()
  const ownerSignature = ownerValues ? createOwnerSignature(ownerValues) : undefined

  const lookupOwnerAddress = useCallback(
    async (owner: Owner, index: number) => {
      if (!owner.address || owner.address === '') {
        return
      }

      update(`${index}.resolving`, true)

      const { address } = parsePrefixedAddress(owner.address)

      // Lookup Addressbook
      const nameFromAddressBook = addressBook[address]
      if (nameFromAddressBook) {
        update(`${index}.name`, nameFromAddressBook)
        update(`${index}.resolving`, false)
        return
      }
      if (!ethersProvider || !chainInfo || !hasFeature(chainInfo, FEATURES.DOMAIN_LOOKUP)) {
        update(`${index}.resolving`, false)
        return
      }

      // Lookup ENS
      const ensName = await lookupAddress(ethersProvider, address)
      if (ensName) {
        update(`${index}.name`, ensName)
        update(`${index}.resolving`, false)
        return
      }

      update(`${index}.resolving`, false)
    },
    [update, addressBook, ethersProvider, chainInfo],
  )

  useEffect(() => {
    if (!ownerValues) return

    ownerValues.forEach(lookupOwnerAddress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerValues?.length, ownerSignature, lookupOwnerAddress])
}
