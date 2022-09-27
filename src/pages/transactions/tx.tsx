import type { NextPage } from 'next'
import Head from 'next/head'

import TxHeader from '@/components/transactions/TxHeader'
import SingleTx from '@/components/transactions/SingleTx'

const SingleTransaction: NextPage = () => {
  return (
    <>
      <Head>
        <title>Safe – Transaction details</title>
      </Head>

      <TxHeader />

      <main>
        <SingleTx />
      </main>
    </>
  )
}

export default SingleTransaction
