import { type AddressBookState } from '@/store/addressBookSlice'
import { LOCAL_STORAGE_DATA, parseLsValue } from './common'

const OLD_LS_KEY = 'SAFE__addressBook'

type OldAddressBook = Array<{ address: string; name: string; chainId: string }>

export const migrateAddressBook = (lsData: LOCAL_STORAGE_DATA): AddressBookState | void => {
  const legacyAb = parseLsValue<OldAddressBook>(lsData[OLD_LS_KEY])
  if (Array.isArray(legacyAb)) {
    console.log('Migrating address book')

    const newAb = legacyAb.reduce<AddressBookState>((acc, { address, name, chainId }) => {
      acc[chainId] = acc[chainId] || {}
      acc[chainId][address] = name
      return acc
    }, {})

    return newAb
  }
}
