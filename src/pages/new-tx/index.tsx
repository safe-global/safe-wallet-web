import NewTxMenu from '@/components/new-tx'
import type { NextPage } from 'next'
import Head from 'next/head'

const NewTx: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – New transaction'}</title>
      </Head>

      <NewTxMenu />
    </>
  )
}

export default NewTx
