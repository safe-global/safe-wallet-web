import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { GeoblockingContext } from '@/components/common/GeoblockingProvider'
import { useContext } from 'react'
import { AppRoutes } from '@/config/routes'
import dynamic from 'next/dynamic'

const SwapWidgetNoSSR = dynamic(() => import('@/features/swap'), { ssr: false })
const Swap: NextPage = () => {
  const router = useRouter()
  const isBlockedCountry = useContext(GeoblockingContext)
  const { token, amount } = router.query

  if (isBlockedCountry) {
    router.replace(AppRoutes['403'])
  }

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
        <SwapWidgetNoSSR sell={sell} />
      </main>
    </>
  )
}

export default Swap
