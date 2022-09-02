import { useEffect } from 'react'
import { Paper } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { SAFE_APPS_EVENTS, trackEvent } from '@/services/analytics'
import { useSafeAppFromBackend } from '@/hooks/safe-apps/useSafeAppFromBackend'
import { useSafeAppFromManifest } from '@/hooks/safe-apps/useSafeAppFromManifest'
import { SafeAppDetails } from '@/components/safe-apps/SafeAppLandingPage/SafeAppDetails'
import { TryDemo } from '@/components/safe-apps/SafeAppLandingPage/TryDemo.'
import { UseApp } from '@/components/safe-apps/SafeAppLandingPage/UseApp'

type Props = {
  appUrl: string
  chainId: string
}

const SafeAppLanding = ({ appUrl, chainId }: Props) => {
  const { safeApp, isLoading } = useSafeAppFromManifest(appUrl, chainId)
  const [backendApp, , backendAppLoading] = useSafeAppFromBackend(appUrl)

  useEffect(() => {
    if (!isLoading && safeApp) {
      trackEvent({
        ...SAFE_APPS_EVENTS.SHARED_APP_LANDING,
        label: safeApp.name,
      })
      trackEvent({
        ...SAFE_APPS_EVENTS.SHARED_APP_CHAIN_ID,
        label: chainId,
      })
    }
  }, [isLoading, safeApp, chainId])

  if (isLoading || backendAppLoading) {
    return <div>Loading...</div>
  }

  if (!safeApp) {
    return <div>No safe app found</div>
  }

  return (
    <Grid container>
      <Grid md lg={6} lgOffset={3}>
        <Paper sx={{ p: 6 }}>
          <SafeAppDetails app={backendApp || safeApp} showDefaultListWarning={!backendApp} />
          <Grid container sx={{ mt: 4 }} rowSpacing={{ xs: 2, sm: 2 }}>
            <Grid xs={12} sm={12} md={6}>
              <UseApp />
            </Grid>
            <Grid xs={12} sm={12} md={6}>
              <TryDemo />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  )
}

export { SafeAppLanding }
