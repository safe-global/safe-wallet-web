import Bundle from '@/features/bundle'
import type { NextPage } from 'next'
import Head from 'next/head'

const BundlePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Bundle'}</title>
      </Head>

      <main>
        <Bundle />
      </main>
    </>
  )
}

export default BundlePage
