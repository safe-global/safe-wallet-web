import Head from 'next/head'
import Typography from '@mui/material/Typography'
import type { NextPage } from 'next'

import SingleMsg from '@/components/messages/SingleMsg'

const SingleTransaction: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – Message details</title>
      </Head>

      <main>
        <Typography variant="h3" fontWeight={700} pt={1} mb={3}>
          Message details
        </Typography>

        <SingleMsg />
      </main>
    </>
  )
}

export default SingleTransaction
