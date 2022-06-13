import Storage from '@/services/localStorage/Storage'
import newStorage from '@/services/localStorage/local'
import { addressBookSlice, AddressBookState } from '@/store/addressBookSlice'

// Legacy keys
const LEGACY_PREFIX = 'SAFE__'
const IMMORTAL_PREFIX = '_immortal|v2_'

// Migrate legacy localStorage data to the new format and keys
const migrateStorage = () => {
  if (typeof window === 'undefined') return

  // A localStorage reader w/o any prefix
  const oldStorage = new Storage(window.localStorage, '')

  // Address Book
  ;(() => {
    const oldKey = LEGACY_PREFIX + 'addressBook'
    const legacyAb = oldStorage.getItem<Array<{ address: string; name: string; chainId: string }>>(oldKey)

    if (Array.isArray(legacyAb)) {
      console.log('Migrating address book')

      const newAb = legacyAb.reduce<AddressBookState>((acc, { address, name, chainId }) => {
        acc[chainId] = acc[chainId] || {}
        acc[chainId][address] = name
        return acc
      }, {})

      newStorage.setItem<AddressBookState>(addressBookSlice.name, newAb)
      oldStorage.removeItem(oldKey)
    }
  })()

  // Immortal keys
  ;(() => {
    console.log('Migrating immortal keys...', IMMORTAL_PREFIX)
    // TODO: migrate immortal keys
  })()
}

export default migrateStorage

// Call immediately on import
migrateStorage()
