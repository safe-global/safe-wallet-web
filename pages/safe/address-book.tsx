import AddressBookTable from '@/components/address-book/AddressBookTable'
import type { NextPage } from 'next'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { PaddedMain } from '@/components/common/PaddedMain'
import ABIcon from '@/public/images/sidebar/address-book.svg'

const AddressBook: NextPage = () => {
  return (
    <PaddedMain>
      <Breadcrumbs Icon={ABIcon} first="Address Book" />
      <AddressBookTable />
    </PaddedMain>
  )
}

export default AddressBook
