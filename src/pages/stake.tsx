import type { NextPage } from 'next'
import Head from 'next/head'
import { Widget } from '@/components/stake/Widget'

const Stake: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Stake'}</title>
      </Head>

      <Widget />
    </>
  )
}

export default Stake
