import Head from 'next/head'
import type { NextPage } from 'next'

import PaginatedMsgs from '@/components/safeMessages/PaginatedMsgs'
import TxHeader from '@/components/transactions/TxHeader'
import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'

const Messages: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – Messages</title>
      </Head>

      <TxHeader action={<NavTabs tabs={transactionNavItems} />} />

      <main>
        <PaginatedMsgs />
      </main>
    </>
  )
}

export default Messages
