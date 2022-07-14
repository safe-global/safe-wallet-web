import AddressBookTable from '@/components/address-book/AddressBookTable'
import type { NextPage } from 'next'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import ABIcon from '@/public/images/sidebar/address-book.svg'

const AddressBook: NextPage = () => {
  return (
    <main>
      <Breadcrumbs Icon={ABIcon} first="Address Book" />
      <AddressBookTable />
    </main>
  )
}

export default AddressBook
