import PaginatedTxns from '@/components/common/PaginatedTxns'
import BatchExecuteButton from '@/components/transactions/BatchExecuteButton'
import { BatchExecuteHoverProvider } from '@/components/transactions/BatchExecuteButton/BatchExecuteHoverProvider'
import TxHeader from '@/components/transactions/TxHeader'
import RecoveryList from '@/features/recovery/components/RecoveryList'
import { usePendingTxsQueue, useShowUnsignedQueue } from '@/hooks/usePendingTxs'
import useTxQueue from '@/hooks/useTxQueue'
import { Box } from '@mui/material'
import type { NextPage } from 'next'
import Head from 'next/head'

const Queue: NextPage = () => {
  const showPending = useShowUnsignedQueue()

  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Transaction queue'}</title>
      </Head>

      <BatchExecuteHoverProvider>
        <TxHeader>
          <BatchExecuteButton />
        </TxHeader>

        <main>
          <Box data-sid="91743" mb={4}>
            <RecoveryList />

            {/* Pending unsigned transactions */}
            {showPending && <PaginatedTxns useTxns={usePendingTxsQueue} />}

            {/* The main queue of signed transactions */}
            <PaginatedTxns useTxns={useTxQueue} />
          </Box>
        </main>
      </BatchExecuteHoverProvider>
    </>
  )
}

export default Queue
