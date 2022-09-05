import { useEffect } from 'react'
import { Paper } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { SAFE_APPS_EVENTS, trackEvent } from '@/services/analytics'
import { useSafeAppFromBackend } from '@/hooks/safe-apps/useSafeAppFromBackend'
import { useSafeAppFromManifest } from '@/hooks/safe-apps/useSafeAppFromManifest'
import { SafeAppDetails } from '@/components/safe-apps/SafeAppLandingPage/SafeAppDetails'
import { TryDemo } from '@/components/safe-apps/SafeAppLandingPage/TryDemo'
import { UseApp } from '@/components/safe-apps/SafeAppLandingPage/UseApp'
import useWallet from '@/hooks/wallets/useWallet'
import { AppRoutes } from '@/config/routes'
import { SAFE_APPS_DEMO_SAFE_MAINNET } from '@/config/constants'

type Props = {
  appUrl: string
  chainId: string
}

const SafeAppLanding = ({ appUrl, chainId }: Props) => {
  const { safeApp, isLoading } = useSafeAppFromManifest(appUrl, chainId)
  const [backendApp, , backendAppLoading] = useSafeAppFromBackend(appUrl)
  const wallet = useWallet()

  // show demo if the app was shared for mainnet or we can find the mainnet chain id on the backend
  const showDemo = chainId === '1' || !!backendApp?.chainIds.includes('1')

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
            <Grid xs={12} sm={12} md={showDemo ? 6 : 12}>
              <UseApp wallet={wallet} />
            </Grid>
            {showDemo && (
              <Grid xs={12} sm={12} md={6}>
                <TryDemo demoUrl={`${AppRoutes.safe.apps}?safe=${SAFE_APPS_DEMO_SAFE_MAINNET}&appUrl=${appUrl}`} />
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  )
}

export { SafeAppLanding }
