import { type AddressBookState } from '@/store/addressBookSlice'
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
