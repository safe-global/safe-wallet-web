import type { NextPage } from 'next'
import Head from 'next/head'
import Login from '@/components/welcome/Login'

const LoginPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Login'}</title>
      </Head>

      <Login></Login>
    </>
  )
}

export default LoginPage
