import type { NextPage } from 'next'
import Head from 'next/head'
import useTxQueue from '@/hooks/useTxQueue'
import PaginatedTxns from '@/components/common/PaginatedTxns'
import TxHeader from '@/components/transactions/TxHeader'
import BatchExecuteButton from '@/components/transactions/BatchExecuteButton'
import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'
import { Box } from '@mui/material'
import { BatchExecuteHoverProvider } from '@/components/transactions/BatchExecuteButton/BatchExecuteHoverProvider'
import { usePendingTxsQueue } from '@/hooks/usePendingTxs'

const Queue: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – Transaction queue</title>
      </Head>

      <BatchExecuteHoverProvider>
        <TxHeader
          action={
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <NavTabs tabs={transactionNavItems} />
              <BatchExecuteButton />
            </Box>
          }
        />

        <main>
          <Box mb={4}>
            <PaginatedTxns useTxns={usePendingTxsQueue} />
            <PaginatedTxns useTxns={useTxQueue} />
          </Box>
        </main>
      </BatchExecuteHoverProvider>
    </>
  )
}

export default Queue
