import { useEffect } from "react"
import Storage from '@/services/localStorage/Storage'
import local from '@/services/localStorage/local'
import { addressBookSlice, AddressBookState } from "@/store/addressBookSlice"
import { currencySlice } from "@/store/currencySlice"

// A localStorage reader w/o any prefix
const oldStorage = new Storage(typeof window !== 'undefined' ? window.localStorage : undefined, '')
// A localStorage with the current prefix
const newStorage = local

// Legacy keys
const LEGACY_PREFIX = 'SAFE__'
const IMMORTAL_PREFIX = '_immortal|v2_'

// Migrate legacy localStorage data to the new format and keys
const useMigrateStorage = () => {
  // Address Book
  useEffect(() => {
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
      //oldStorage.removeItem(oldKey)
    }
  }, [])

  // Currency
  useEffect(() => {
    const oldKey = LEGACY_PREFIX + 'currencyValues.selectedCurrency'
    const legacyCurrency = oldStorage.getItem<string>(oldKey)
    if (legacyCurrency) {
      console.log('Migrating the currency preference')
      newStorage.setItem<string>(currencySlice.name, legacyCurrency)
      //oldStorage.removeItem(oldKey)
    }
  }, [])

  // Immortal keys
  useEffect(() => {
    console.log('Migrating immortal keys...', IMMORTAL_PREFIX)
    // TODO: migrate immortal keys
  }, [])
}

export default useMigrateStorage
