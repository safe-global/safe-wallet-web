import type { NextPage } from 'next'
import Head from 'next/head'
import SafeList from '@/components/common/SafeList'
import { DataWidget } from '@/components/welcome/SafeListDrawer/DataWidget'

const LoginPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Login'}</title>
      </Head>

      <SafeList />
      <DataWidget />
    </>
  )
}

export default LoginPage
