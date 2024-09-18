import { useMemo } from 'react'
import AppFrame from '@/components/safe-apps/AppFrame'
import { getEmptySafeApp } from '@/components/safe-apps/utils'
import { useGetStakeWidgetUrl } from '@/features/stake/hooks/useGetStakeWidgetUrl'
import { widgetAppData } from '@/features/stake/constants'
import css from '@/components/dashboard/PendingTxs/styles.module.css'
import { Typography } from '@mui/material'
import { ViewAllLink } from '@/components/dashboard/styled'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'

const StakingDashboardWidget = () => {
  const url = useGetStakeWidgetUrl('', 'overview') + '&interactive=false&navigation=none&widget_width=full'
  const router = useRouter()
  const stakeUrl = useMemo(
    () => ({
      pathname: AppRoutes.stake,
      query: { safe: router.query.safe },
    }),
    [router.query.safe],
  )

  const appData = useMemo(
    () => ({
      ...getEmptySafeApp(),
      ...widgetAppData,
      url,
    }),
    [url],
  )

  return (
    <>
      <div className={css.title}>
        <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
          Stake
        </Typography>

        <ViewAllLink url={stakeUrl} text="Go to staking" />
      </div>
      <AppFrame
        appUrl={appData.url}
        allowedFeaturesList="clipboard-read; clipboard-write"
        safeAppFromManifest={appData}
        isNativeEmbed
      />
    </>
  )
}

export default StakingDashboardWidget
