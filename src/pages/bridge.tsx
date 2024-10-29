import type { NextPage } from 'next'
import Head from 'next/head'
import dynamic from 'next/dynamic'

const LazyBridgePage = dynamic(() => import('@/features/bridge/components/BridgePage'), { ssr: false })

const BridgePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Bridge'}</title>
      </Head>

      <LazyBridgePage />
    </>
  )
}

export default BridgePage
