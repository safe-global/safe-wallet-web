import type { NextPage } from 'next'
import Head from 'next/head'
import { CircularProgress } from '@mui/material'

import AssetsTable from '@/components/balances/AssetsTable'
import AssetsHeader from '@/components/balances/AssetsHeader'
import useBalances from '@/hooks/useBalances'
import { useEffect, useState } from 'react'
import { trackEvent, ASSETS_EVENTS } from '@/services/analytics'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import NoAssetsIcon from '@/public/images/balances/no-assets.svg'
import useHiddenTokens from '@/hooks/useHiddenTokens'

const Balances: NextPage = () => {
  const { balances, loading, error } = useBalances()
  const hiddenAssets = useHiddenTokens()
  const [showHiddenAssets, setShowHiddenAssets] = useState(false)
  const toggleShowHiddenAssets = () => setShowHiddenAssets((prev) => !prev)

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

      <AssetsHeader
        showHiddenAssets={showHiddenAssets}
        toggleShowHiddenAssets={toggleShowHiddenAssets}
        currencySelect
        hiddenAssets
      />

      <main>
        {loading && <CircularProgress size={20} sx={{ marginTop: 2 }} />}

        {!error ? (
          <AssetsTable setShowHiddenAssets={setShowHiddenAssets} showHiddenAssets={showHiddenAssets} />
        ) : (
          <PagePlaceholder img={<NoAssetsIcon />} text="There was an error loading your assets" />
        )}
      </main>
    </>
  )
}

export default Balances
