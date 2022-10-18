import type { NextPage } from 'next'
import Head from 'next/head'
import PaginatedTxns from '@/components/common/PaginatedTxns'
import TxHeader from '@/components/transactions/TxHeader'
import { Alert, AlertTitle, Box, SvgIcon } from '@mui/material'
import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'
import useDraftTransactions from '@/hooks/useDraftTransactions'
import ShareIcon from '@/public/images/common/share.svg'

const History: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – Draft transactions</title>
      </Head>

      <TxHeader
        title="Draft transactions"
        action={
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <NavTabs tabs={transactionNavItems} />
          </Box>
        }
      />

      <main>
        <Alert severity="info" sx={{ marginBottom: 6 }}>
          <AlertTitle>Sign or execute draft transactions</AlertTitle>
          The list of drafts is only visible to you, but you can share{' '}
          <SvgIcon component={ShareIcon} inheritViewBox fontSize="inherit" sx={{ verticalAlign: 'middle' }} /> links to
          individual transactions.
        </Alert>

        <PaginatedTxns useTxns={useDraftTransactions} />
      </main>
    </>
  )
}

export default History
