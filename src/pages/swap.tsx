import type { NextPage } from 'next'
import Head from 'next/head'
import { SwapWidget } from '@/components/swap/SwapWidget'
import { useRouter } from 'next/router'

const Swap: NextPage = () => {
  const router = useRouter()
  const { token, amount } = router.query
  let sell = undefined
  if(token && amount) {
    sell = {
      asset: token,
      amount: amount
    }
  }
  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Swap'}</title>
      </Head>

      <main>
        <SwapWidget sell={sell} />
      </main>
    </>
  )
}

export default Swap
