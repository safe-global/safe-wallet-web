import type { NextPage } from 'next'
import Head from 'next/head'
import useTxHistory from '@/hooks/useTxHistory'
import PaginatedTxns from '@/components/common/PaginatedTxns'
import TxHeader from '@/components/transactions/TxHeader'
import { Box } from '@mui/material'
import NavTabs from '@/components/common/NavTabs'
import { transactionNavItems } from '@/components/sidebar/SidebarNavigation/config'
import { useState } from 'react'
import Button from '@mui/material/Button'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import TxFilterForm from '@/components/transactions/TxFilterForm'
import { useTxFilter } from '@/utils/tx-history-filter'
import Link from 'next/link'
import type { UrlObject } from 'url'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'

const History: NextPage = () => {
  const [filter] = useTxFilter()
  const router = useRouter()
  const [showFilter, setShowFilter] = useState(false)

  const toggleFilter = () => {
    setShowFilter((prev) => !prev)
  }

  const txCreateLink: UrlObject = {
    pathname: AppRoutes.transactions.create,
    query: { safe: router.query.safe },
  }

  const ExpandIcon = showFilter ? ExpandLessIcon : ExpandMoreIcon
  return (
    <>
      <Head>
        <title>Safe – Transaction history</title>
      </Head>

      <TxHeader
        action={
          <Box display="flex" justifyContent="flex-start" alignItems="center">
            <NavTabs tabs={transactionNavItems} />
            <Link href={txCreateLink} passHref>
              <Button size="small" variant="contained" color="primary" style={{ marginLeft: 'auto' }}>
                New transaction
              </Button>
            </Link>
            <Button
              variant="outlined"
              onClick={toggleFilter}
              size="small"
              endIcon={<ExpandIcon />}
              style={{ marginLeft: '5px' }}
            >
              {filter?.type ?? 'Filter'}
            </Button>
          </Box>
        }
      />

      <main>
        {showFilter && <TxFilterForm toggleFilter={toggleFilter} />}
        <PaginatedTxns useTxns={useTxHistory} />
      </main>
    </>
  )
}

export default History
