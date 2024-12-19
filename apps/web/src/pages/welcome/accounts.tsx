import type { NextPage } from 'next'
import Head from 'next/head'
import MyAccounts from '@/features/myAccounts'

const Accounts: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – My accounts'}</title>
      </Head>

      <MyAccounts />
    </>
  )
}

export default Accounts
