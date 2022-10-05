import type { NextPage } from 'next'
import Head from 'next/head'

import SingleTx from '@/components/transactions/SingleTx'
import Typography from '@mui/material/Typography'

const SingleTransaction: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – Transaction details</title>
      </Head>

      <main>
        <div>
          <Typography variant="h3" fontWeight={700} mb={3}>
            Transaction details
          </Typography>
        </div>
        <SingleTx />
      </main>
    </>
  )
}

export default SingleTransaction
