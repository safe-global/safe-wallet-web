import type { NextPage } from 'next'
import Head from 'next/head'
import MyAccounts from '@/components/welcome/MyAccounts'
import { DataWidget } from '@/components/welcome/MyAccounts/DataWidget'

const Accounts: NextPage = () => {
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – My accounts'}</title>
      </Head>

      <MyAccounts />
      <DataWidget />
    </>
  )
}

export default Accounts
