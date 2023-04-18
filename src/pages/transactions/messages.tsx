import Head from 'next/head'
import type { NextPage } from 'next'

import PaginatedMsgs from '@/components/safe-messages/PaginatedMsgs'
import TxHeader from '@/components/transactions/TxHeader'
import SignedMessagesHelpLink from '@/components/transactions/SignedMessagesHelpLink'

const Messages: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – Messages</title>
      </Head>

      <TxHeader>
        <SignedMessagesHelpLink />
      </TxHeader>

      <main>
        <PaginatedMsgs />
      </main>
    </>
  )
}

export default Messages
