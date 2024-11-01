import Head from 'next/head'
import dynamic from 'next/dynamic'
import type { NextPage } from 'next'

import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'
import { AppRoutes } from '@/config/routes'
import Navigate from '@/components/common/Navigate'

const LazyBridgePage = dynamic(() => import('@/features/bridge/BridgePage'), { ssr: false })

const BridgePage: NextPage = () => {
  const isFeatureEnabled = useHasFeature(FEATURES.BRIDGE)

  if (!isFeatureEnabled) {
    return <Navigate to={AppRoutes.home} replace />
  }

  return (
    <>
      <Head>
        <title>{'Safe{Wallet} – Bridge'}</title>
      </Head>
      <LazyBridgePage />
    </>
  )
}

export default BridgePage
