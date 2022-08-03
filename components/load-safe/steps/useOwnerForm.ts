import { Owner } from '@/components/create-safe'
import useAddressBook from '@/hooks/useAddressBook'
import { useMnemonicSafeName } from '@/hooks/useMnemonicName'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { lookupAddress } from '@/services/domains'
import { parsePrefixedAddress } from '@/utils/addresses'
import { useCallback, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'

const isOwnerField = (ownerValue: any): ownerValue is Owner[] | Owner | undefined => {
  if (ownerValue === undefined) {
    return true
  }
  if (Array.isArray(ownerValue)) {
    return ownerValue.every((owner: Owner) => owner.address !== undefined && owner.name !== undefined)
  }
  return ownerValue.address !== undefined && ownerValue.name !== undefined
}

const createOwnerSignature = (ownerValue: Owner | Owner[]) =>
  Array.isArray(ownerValue) ? ownerValue.map((owner) => owner.address).join('') : ownerValue.address

export const useOwnerForm = (fieldName: string, formMethods: UseFormReturn<any, object>, useFallbackName = false) => {
  const { watch, setValue } = formMethods

  const fallbackName = useMnemonicSafeName()

  const owners = watch(fieldName)

  const addressBook = useAddressBook()

  const ethersProvider = useWeb3ReadOnly()

  if (!isOwnerField(owners)) {
    throw Error('Form field needs to be a owner or an array of owners')
  }

  const ownerSignature = owners ? createOwnerSignature(owners) : undefined

  const lookupOwnerAddress = useCallback(
    async (owner: Owner, index?: number) => {
      if (owner.name !== '' && owner.name !== fallbackName) {
        return
      }
      const formFieldName = index === undefined ? fieldName : `${fieldName}.${index}`
      const { address } = parsePrefixedAddress(owner.address)

      setValue(`${formFieldName}.resolving`, true)
      // Lookup Addressbook
      const nameFromAddressbook = addressBook[address]
      if (nameFromAddressbook) {
        setValue(`${formFieldName}.name`, nameFromAddressbook)
        setValue(`${formFieldName}.resolving`, false)
        return
      }

      // TODO: if chain does not have ENS feature also return here
      if (!ethersProvider) {
        setValue(`${formFieldName}.resolving`, false)
        return
      }

      // Lookup ENS
      const ensName = await lookupAddress(ethersProvider, address)
      if (ensName) {
        setValue(`${formFieldName}.name`, ensName)
        setValue(`${formFieldName}.resolving`, false)
        return
      }
      if (useFallbackName) {
        setValue(`${formFieldName}.name`, fallbackName)
      }
      setValue(`${formFieldName}.resolving`, false)
    },
    [addressBook, ethersProvider, fallbackName, fieldName, setValue, useFallbackName],
  )

  useEffect(() => {
    if (!owners) {
      return
    }
    if (Array.isArray(owners)) {
      owners.forEach(lookupOwnerAddress)
    } else {
      lookupOwnerAddress(owners)
    }
  }, [owners, ownerSignature, lookupOwnerAddress, fallbackName])
}
