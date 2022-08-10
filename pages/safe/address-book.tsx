import type { NextPage } from 'next'
import Head from 'next/head'
import AddressBookTable from '@/components/address-book/AddressBookTable'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import ABIcon from '@/public/images/sidebar/address-book.svg'

const AddressBook: NextPage = () => {
  return (
    <main>
      <Head>
        <title>Safe – Address book</title>
      </Head>

      <Breadcrumbs Icon={ABIcon} first="Address book" />

      <AddressBookTable />
    </main>
  )
}

export default AddressBook
