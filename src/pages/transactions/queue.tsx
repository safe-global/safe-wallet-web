import type { NextPage } from 'next'
import Head from 'next/head'
import useTxQueue from '@/hooks/useTxQueue'
import PaginatedTxns from '@/components/common/PaginatedTxns'
import TxHeader from '@/components/transactions/TxHeader'
import BatchExecuteButton from '@/components/transactions/BatchExecuteButton'
import { Box } from '@mui/material'
import { BatchExecuteHoverProvider } from '@/components/transactions/BatchExecuteButton/BatchExecuteHoverProvider'
import { useHasPendingTxs, usePendingTxsQueue } from '@/hooks/usePendingTxs'

const Queue: NextPage = () => {
  const hasPending = useHasPendingTxs()

  return (
    <>
      <Head>
        <title>Safe – Transaction queue</title>
      </Head>

      <BatchExecuteHoverProvider>
        <TxHeader>
          <BatchExecuteButton />
        </TxHeader>

        <main>
          <Box mb={4}>
            {/* Pending unsigned transactions */}
            {hasPending && <PaginatedTxns useTxns={usePendingTxsQueue} />}

            {/* The main queue of signed transactions */}
            <PaginatedTxns useTxns={useTxQueue} />
          </Box>
        </main>
      </BatchExecuteHoverProvider>
    </>
  )
}

export default Queue
