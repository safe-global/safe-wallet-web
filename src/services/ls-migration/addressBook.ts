import { initialState } from '@/store/addressBookSlice'
import type { AddressBook, AddressBookState } from '@/store/addressBookSlice'
import { utils } from 'ethers'
import type { LOCAL_STORAGE_DATA } from './common'
import { parseLsValue } from './common'

const OLD_LS_KEY = 'SAFE__addressBook'

type OldAddressBook = Array<{ address: string; name: string; chainId: string }>

export const migrateAddressBook = (lsData: LOCAL_STORAGE_DATA): AddressBookState | void => {
  const legacyAb = parseLsValue<OldAddressBook>(lsData[OLD_LS_KEY])
  if (Array.isArray(legacyAb)) {
    console.log('Migrating address book')

    const newAb = legacyAb.reduce<AddressBookState>((acc, { address, name, chainId }) => {
      if (!name || !address || !utils.isAddress(address)) {
        return acc
      }
      acc[chainId] = acc[chainId] || {}
      acc[chainId][address] = name
      return acc
    }, {})

    if (Object.keys(newAb).length > 0) {
      return newAb
    }
  }
}

// Temporary post-migration fix for malformed data
export const sanitizeMigratedAddressBook = (state: AddressBookState): AddressBookState => {
  const sanitizedAb = Object.keys(state).reduce<AddressBookState>((sanitizedAb, chainId) => {
    const chainAb = state[chainId]

    const sanitizedChainAb = Object.keys(chainAb).reduce<AddressBook>((sanitizedChainAb, address) => {
      if (!address || !utils.isAddress(address)) {
        return sanitizedChainAb
      }

      const name = chainAb[address]
      if (!name) {
        return sanitizedChainAb
      }

      sanitizedChainAb[address] = name

      return sanitizedChainAb
    }, {})

    if (Object.keys(sanitizedChainAb).length > 0) {
      sanitizedAb[chainId] = sanitizedChainAb
    }

    return sanitizedAb
  }, {})

  if (Object.keys(sanitizedAb).length > 0) {
    return sanitizedAb
  }

  return initialState
}
