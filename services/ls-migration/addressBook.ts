import newStorage from '@/services/localStorage/local'
import { addressBookSlice, type AddressBookState } from '@/store/addressBookSlice'
import { LOCAL_STORAGE_DATA, parseLsValue } from './common'

const OLD_LS_KEY = 'SAFE__addressBook'

type OldAddressBook = Array<{ address: string; name: string; chainId: string }>

export const migrateAddressBook = (lsData: LOCAL_STORAGE_DATA): void => {
  // Don't migrate if the new storage is already populated
  const currAb = newStorage.getItem<AddressBookState>(addressBookSlice.name)
  if (currAb && Object.keys(currAb).length > 0) {
    return
  }

  const legacyAb = parseLsValue<OldAddressBook>(lsData[OLD_LS_KEY])
  if (Array.isArray(legacyAb)) {
    console.log('Migrating address book')

    const newAb = legacyAb.reduce<AddressBookState>((acc, { address, name, chainId }) => {
      acc[chainId] = acc[chainId] || {}
      acc[chainId][address] = name
      return acc
    }, {})

    newStorage.setItem<AddressBookState>(addressBookSlice.name, newAb)
  }
}
