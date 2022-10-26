import { Box, Card } from '@mui/material'
import AppFrame from '@/components/safe-apps/AppFrame'
import { useBrowserPermissions } from '@/hooks/safe-apps/permissions'
import SafeAppsErrorBoundary from '@/components/safe-apps/SafeAppsErrorBoundary'
import SafeAppsLoadError from '@/components/safe-apps/SafeAppsErrorBoundary/SafeAppsLoadError'
import type { WidgetType } from '@/components/dashboard/GovernanceSection/GovernanceSection'

const SafeWidget = ({ widget }: { widget: WidgetType }) => {
  const { appUrl } = widget
  const { getAllowedFeaturesList } = useBrowserPermissions()

  if (!appUrl) return <></>

  return (
    <Card>
      <Box sx={{ height: '400px' }}>
        <SafeAppsErrorBoundary render={() => <SafeAppsLoadError onBackToApps={() => {}} />}>
          <AppFrame appUrl={appUrl} allowedFeaturesList={getAllowedFeaturesList(appUrl)} isQueueBarDisabled={true} />
        </SafeAppsErrorBoundary>
      </Box>
    </Card>
  )
}

export default SafeWidget
