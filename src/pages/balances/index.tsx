import type { NextPage } from 'next'
import Head from 'next/head'
import { CircularProgress } from '@mui/material'

import AssetsTable from '@/components/balances/AssetsTable'
import AssetsHeader from '@/components/balances/AssetsHeader'
import useBalances from '@/hooks/useBalances'
import { useEffect } from 'react'
import { trackEvent, ASSETS_EVENTS } from '@/services/analytics'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import NoAssetsIcon from '@/public/images/no-assets.svg'

const Balances: NextPage = () => {
  const { balances, loading, error } = useBalances()

  useEffect(() => {
    if (!loading && balances.items.length === 0) {
      trackEvent({ ...ASSETS_EVENTS.DIFFERING_TOKENS, label: balances.items.length })
    }
  }, [balances, loading])

  return (
    <>
      <Head>
        <title>Safe – Assets</title>
      </Head>

      <AssetsHeader currencySelect />

      <main>
        {loading && <CircularProgress size={20} sx={{ marginTop: 2 }} />}
        {!error ? (
          <AssetsTable items={balances?.items} />
        ) : (
          <PagePlaceholder
            img={<NoAssetsIcon />}
            text="
              There was an error loading your assets"
          />
        )}
      </main>
    </>
  )
}

export default Balances
