import type { NextPage } from 'next'
import Head from 'next/head'
import useTxQueue from '@/hooks/useTxQueue'
import PaginatedTxns from '@/components/common/PaginatedTxns'
import TxHeader from '@/components/transactions/TxHeader'
import BatchExecuteButton from '@/components/transactions/BatchExecuteButton'
import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'
import { Box, Button } from '@mui/material'
import { BatchExecuteHoverProvider } from '@/components/transactions/BatchExecuteButton/BatchExecuteHoverProvider'
import { useRouter } from 'next/router'
import type { UrlObject } from 'url'
import { AppRoutes } from '@/config/routes'
import Link from 'next/link'

const Queue: NextPage = () => {
  const router = useRouter()
  const txCreateLink: UrlObject = {
    pathname: AppRoutes.transactions.create,
    query: { safe: router.query.safe },
  }

  return (
    <>
      <Head>
        <title>Safe – Transaction queue</title>
      </Head>

      <BatchExecuteHoverProvider>
        <TxHeader
          action={
            <Box display="flex" justifyContent="flex-start" alignItems="center">
              <NavTabs tabs={transactionNavItems} />
              <Link href={txCreateLink} passHref>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  style={{ marginLeft: 'auto', marginRight: '8px' }}
                >
                  New transaction
                </Button>
              </Link>
              <BatchExecuteButton />
            </Box>
          }
        />

        <main>
          <PaginatedTxns useTxns={useTxQueue} />
        </main>
      </BatchExecuteHoverProvider>
    </>
  )
}

export default Queue
