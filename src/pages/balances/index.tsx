import type { NextPage } from 'next'
import Head from 'next/head'
import { CircularProgress } from '@mui/material'

import AssetsTable from '@/components/balances/AssetsTable'
import AssetsHeader from '@/components/balances/AssetsHeader'
import useBalances from '@/hooks/useBalances'
import { useEffect } from 'react'
import { trackEvent, ASSETS_EVENTS } from '@/services/analytics'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import NoAssetsIcon from '@/public/images/balances/no-assets.svg'
import HiddenAssetsProvider from '@/components/balances/HiddenAssetsProvider'
import useHiddenTokens from '@/hooks/useHiddenTokens'

const Balances: NextPage = () => {
  const { balances, loading, error } = useBalances(true)
  const hiddenAssets = useHiddenTokens()

  useEffect(() => {
    if (!loading && balances.items.length === 0) {
      trackEvent({ ...ASSETS_EVENTS.DIFFERING_TOKENS, label: balances.items.length })
    }
  }, [balances, loading])

  useEffect(() => {
    if (hiddenAssets) {
      trackEvent({ ...ASSETS_EVENTS.HIDDEN_TOKENS, label: Object.keys(hiddenAssets).length })
    }
  }, [hiddenAssets])

  return (
    <>
      <Head>
        <title>Safe – Assets</title>
      </Head>

      <HiddenAssetsProvider>
        <AssetsHeader currencySelect hiddenAssets />

        <main>
          {loading && <CircularProgress size={20} sx={{ marginTop: 2 }} />}

          {!error ? (
            <AssetsTable />
          ) : (
            <PagePlaceholder img={<NoAssetsIcon />} text="There was an error loading your assets" />
          )}
        </main>
      </HiddenAssetsProvider>
    </>
  )
}

export default Balances
