import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  type AddressBookState,
  selectAddressBook,
  setAddressBook,
  selectAllAddressBooks,
} from '@/store/addressBookSlice'
import local from './localStorage/local'

const ADDRESS_BOOK_KEY = 'addressBooks'
const LEGACY_ADDRESS_BOOK_KEY = 'addressBook' // w/o "s"

export const useInitAddressBook = (): void => {
  const dispatch = useAppDispatch()
  const addressBookState = useAppSelector(selectAllAddressBooks)

  // Migrate legacy address book
  useEffect(() => {
    const legacyAb = local.getItem<Array<{ address: string; name: string; chainId: string }>>(LEGACY_ADDRESS_BOOK_KEY)
    if (Array.isArray(legacyAb)) {
      local.setItem<AddressBookState>(
        ADDRESS_BOOK_KEY,
        legacyAb.reduce<AddressBookState>((acc, { address, name, chainId }) => {
          acc[chainId] = acc[chainId] || {}
          acc[chainId][address] = name
          return acc
        }, {}),
      )
      // Remove legacy address book
      local.removeItem(LEGACY_ADDRESS_BOOK_KEY)
    }
  }, [])

  // Read the address book from local storage and put it to the store
  useEffect(() => {
    const lsAddressBook = local.getItem<AddressBookState>(ADDRESS_BOOK_KEY)
    if (lsAddressBook) {
      dispatch(setAddressBook(lsAddressBook))
    }
  }, [dispatch])

  // Update local storage when the address book store changes
  useEffect(() => {
    if (addressBookState) {
      local.setItem<AddressBookState>(ADDRESS_BOOK_KEY, addressBookState)
    }
  }, [addressBookState])
}

const useAddressBook = () => {
  return useAppSelector(selectAddressBook)
}

export default useAddressBook
