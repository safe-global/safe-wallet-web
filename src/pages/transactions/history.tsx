import PaginatedTxns from '@/components/common/PaginatedTxns'
import TrustedToggle from '@/components/transactions/TrustedToggle'
import TxFilterForm from '@/components/transactions/TxFilterForm'
import TxHeader from '@/components/transactions/TxHeader'
import useTxHistory from '@/hooks/useTxHistory'
import { useTxFilter } from '@/utils/tx-history-filter'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box } from '@mui/material'
import Button from '@mui/material/Button'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useState } from 'react'

const History: NextPage = () => {
  const [filter] = useTxFilter()

  const [showFilter, setShowFilter] = useState(false)

  const toggleFilter = () => {
    setShowFilter((prev) => !prev)
  }

  const ExpandIcon = showFilter ? ExpandLessIcon : ExpandMoreIcon
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Transaction history'}</title>
      </Head>

      <TxHeader>
        <TrustedToggle />

        <Button data-sid="15918" variant="outlined" onClick={toggleFilter} size="small" endIcon={<ExpandIcon />}>
          {filter?.type ?? 'Filter'}
        </Button>
      </TxHeader>

      <main>
        {showFilter && <TxFilterForm toggleFilter={toggleFilter} />}

        <Box data-sid="97299" mb={4}>
          <PaginatedTxns useTxns={useTxHistory} />
        </Box>
      </main>
    </>
  )
}

export default History
