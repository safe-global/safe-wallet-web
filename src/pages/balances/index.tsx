import type { NextPage } from 'next'
import Head from 'next/head'
import { Box, CircularProgress } from '@mui/material'

import AssetsTable from '@/components/balances/AssetsTable'
import AssetsHeader from '@/components/balances/AssetsHeader'
import useBalances from '@/hooks/useBalances'
import { useState } from 'react'

import PagePlaceholder from '@/components/common/PagePlaceholder'
import NoAssetsIcon from '@/public/images/balances/no-assets.svg'
import HiddenTokenButton from '@/components/balances/HiddenTokenButton'
import CurrencySelect from '@/components/balances/CurrencySelect'
import { OnboardingTooltip } from '@/components/common/OnboardingTooltip'
import { AbTest } from '@/services/tracking/abTesting'
import useABTesting from '@/services/tracking/useABTesting'

const LS_ONBOARDING = 'ONBOARDING_HIDDEN_TOKEN_BUTTON'

const Balances: NextPage = () => {
  const { loading, error } = useBalances()
  const [showHiddenAssets, setShowHiddenAssets] = useState(false)
  const toggleShowHiddenAssets = () => setShowHiddenAssets((prev) => !prev)
  const isTooltipShown = useABTesting(AbTest.HIDE_TOKEN_PROMO)

  return (
    <>
      <Head>
        <title>Safe – Assets</title>
      </Head>

      <AssetsHeader>
        <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
          {
            <OnboardingTooltip
              initiallyShown={isTooltipShown}
              widgetLocalStorageId={LS_ONBOARDING}
              text="Spam or unwanted tokens in your asset list? Hide them now!"
            >
              <div>
                <HiddenTokenButton
                  showHiddenAssets={showHiddenAssets}
                  toggleShowHiddenAssets={toggleShowHiddenAssets}
                />
              </div>
            </OnboardingTooltip>
          }
          <CurrencySelect />
        </Box>
      </AssetsHeader>

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
