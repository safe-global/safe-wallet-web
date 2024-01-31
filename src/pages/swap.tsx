import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { CowWidgetCommunicator } from '@/components/swap/CowWidgetCommunicator'

const Swap: NextPage = () => {
  const router = useRouter()
  const { token, amount } = router.query
  let sell = undefined
  if (token && amount) {
    sell = {
      asset: String(token),
      amount: String(amount),
    }
  }
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Swap'}</title>
      </Head>

      <main>
        <CowWidgetCommunicator sell={sell} />
      </main>
    </>
  )
}

export default Swap
