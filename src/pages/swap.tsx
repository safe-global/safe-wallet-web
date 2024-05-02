import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import SwapWidget from '@/features/swap'

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

      <main className="swapWrapper">
        <SwapWidget sell={sell} />
      </main>
    </>
  )
}

export default Swap
