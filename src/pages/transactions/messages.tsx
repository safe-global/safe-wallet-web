import Head from 'next/head'
import type { NextPage } from 'next'

import PaginatedMsgs from '@/components/safe-messages/PaginatedMsgs'
import TxHeader from '@/components/transactions/TxHeader'
import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'
import { Box } from '@mui/material'
import SignedMessagesHelpLink from '@/components/transactions/SignedMessagesHelpLink'

const Messages: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – Messages</title>
      </Head>

      <TxHeader
        action={
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <NavTabs tabs={transactionNavItems} />
            <SignedMessagesHelpLink />
          </Box>
        }
      />

      <main>
        <PaginatedMsgs />
      </main>
    </>
  )
}

export default Messages
