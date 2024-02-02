import type { NextPage } from 'next'
import Head from 'next/head'
import { UniswapWidget } from '@/components/swap/UniswapWidget'


const Swap: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Swap'}</title>
      </Head>

      <main>
        <UniswapWidget />
      </main>
    </>
  )
}

export default Swap
