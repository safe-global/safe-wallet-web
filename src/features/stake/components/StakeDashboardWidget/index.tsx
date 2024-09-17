import { useMemo } from 'react'
import AppFrame from '@/components/safe-apps/AppFrame'
import { getEmptySafeApp } from '@/components/safe-apps/utils'
import { useGetStakeWidgetUrl } from '@/features/stake/hooks/useGetStakeWidgetUrl'
import { widgetAppData } from '@/features/stake/constants'

const StakingDashboardWidget = () => {
  const url = useGetStakeWidgetUrl('', 'overview') + '&interactive=false&navigation=none&widget_width=full'

  const appData = useMemo(
    () => ({
      ...getEmptySafeApp(),
      ...widgetAppData,
      url,
    }),
    [url],
  )

  return (
    <AppFrame
      appUrl={appData.url}
      allowedFeaturesList="clipboard-read; clipboard-write"
      safeAppFromManifest={appData}
      isNativeEmbed
    />
  )
}

export default StakingDashboardWidget
