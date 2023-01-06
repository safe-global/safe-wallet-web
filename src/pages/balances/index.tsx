import type { NextPage } from 'next'
import Head from 'next/head'
import { CircularProgress } from '@mui/material'

import AssetsTable from '@/components/balances/AssetsTable'
import AssetsHeader from '@/components/balances/AssetsHeader'
import useBalances from '@/hooks/useBalances'
import { useState } from 'react'

import PagePlaceholder from '@/components/common/PagePlaceholder'
import NoAssetsIcon from '@/public/images/balances/no-assets.svg'
import useHiddenTokens from '@/hooks/useHiddenTokens'

const Balances: NextPage = () => {
  const { balances, loading, error } = useBalances()
  const hiddenAssets = useHiddenTokens()
  const [showHiddenAssets, setShowHiddenAssets] = useState(false)
  const toggleShowHiddenAssets = () => setShowHiddenAssets((prev) => !prev)

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
