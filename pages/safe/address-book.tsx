import AddressBookTable from '@/components/address-book/AddressBookTable'
import type { NextPage } from 'next'

const AddressBook: NextPage = () => {
  return (
    <main>
      <h2>Address Book</h2>

      <AddressBookTable />
    </main>
  )
}

export default AddressBook
