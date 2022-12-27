import Head from 'next/head'
import type { NextPage } from 'next'

import PaginatedMsgs from '@/components/safe-messages/PaginatedMsgs'
import TxHeader from '@/components/transactions/TxHeader'
import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'
import { Box, SvgIcon, Typography } from '@mui/material'
import InfoIcon from '@/public/images/notifications/info.svg'
import ExternalLink from '@/components/common/ExternalLink'

const SignedMessagesHelpLink = () => (
  <Box display="flex" alignItems="center" gap={1}>
    <SvgIcon component={InfoIcon} inheritViewBox color="border" fontSize="small" />
    {/* TODO: Add link to help article */}
    <ExternalLink suppressIcon href="#">
      <Typography variant="body2" fontWeight={700}>
        What are signed messages?
      </Typography>
    </ExternalLink>
  </Box>
)

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
