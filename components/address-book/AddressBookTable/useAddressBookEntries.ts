import useAddressBook from '@/hooks/useAddressBook'
import { useEffect, useState } from 'react'

// Redux's persistence initialises outside of React. It is empty server-side and
// populated client-side. We therefore can't rely on the initial `preloadedState`.

const useAddressBookEntries = () => {
  const [addressBookEntries, setAddressBookEntries] = useState<[string, string][]>([])
  const addressBook = useAddressBook()

  useEffect(() => {
    const entries = Object.entries(addressBook)
    setAddressBookEntries(entries)
  }, [addressBook])

  return addressBookEntries
}

export default useAddressBookEntries
