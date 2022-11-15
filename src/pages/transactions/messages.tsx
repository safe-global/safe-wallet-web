import Head from 'next/head'
import { Typography, Link, SvgIcon } from '@mui/material'
import type { NextPage } from 'next'

import LinkIcon from '@/public/images/common/link.svg'
import NoMessagesIcon from '@/public/images/messages/no-messages.svg'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import TxHeader from '@/components/transactions/TxHeader'
import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'

const History: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – Messages</title>
      </Head>

      <TxHeader action={<NavTabs tabs={transactionNavItems} />} />

      <main>
        <PagePlaceholder
          img={<NoMessagesIcon />}
          text={
            <Typography color="primary.light" m={2} maxWidth="600px">
              Some applications allow you to interact with them via off-chain contract signatures
              (&ldquo;messages&ldquo;) that you can generate with your Safe.
            </Typography>
          }
        >
          {/* TODO: Add link to help article */}
          <Link rel="noopener noreferrer" target="_blank" href="#" fontWeight={700}>
            Learn more about off-chain messages{' '}
            <SvgIcon component={LinkIcon} inheritViewBox fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
          </Link>
        </PagePlaceholder>
      </main>
    </>
  )
}

export default History
