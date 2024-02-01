import type { NextPage } from 'next'
import Head from 'next/head'
import NewSafe from '@/components/welcome/NewSafe'
import useWallet from '@/hooks/wallets/useWallet'
import SafeList from '@/components/common/SafeList'
import { DataWidget } from '@/components/welcome/DataWidget'

const Welcome: NextPage = () => {
  const wallet = useWallet()
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Welcome'}</title>
      </Head>

      {wallet ? (
        <>
          <SafeList />
          <DataWidget />
        </>
      ) : (
        <NewSafe />
      )}
    </>
  )
}

export default Welcome
