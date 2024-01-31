import type { NextPage } from 'next'
import Head from 'next/head'
import { CowWidget } from '@/components/swap/CowWidget'


const Swap: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Swap'}</title>
      </Head>

      <main>
        <CowWidget />
      </main>
    </>
  )
}

export default Swap
