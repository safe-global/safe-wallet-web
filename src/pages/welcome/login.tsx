import type { NextPage } from 'next'
import Head from 'next/head'
import SafeList from '@/components/common/SafeList'

const Login: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Login'}</title>
      </Head>

      <SafeList />
    </>
  )
}

export default Login
