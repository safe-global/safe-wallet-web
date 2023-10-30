import type { NextPage } from 'next'
import Head from 'next/head'
import NewSafeSocial from '@/components/welcome/NewSafeSocial'

const Welcome: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Welcome'}</title>
      </Head>

      <NewSafeSocial />
    </>
  )
}

export default Welcome
