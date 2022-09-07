import { useEffect } from 'react'
import { Paper } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { OVERVIEW_EVENTS, SAFE_APPS_EVENTS, trackEvent } from '@/services/analytics'
import { useSafeAppFromBackend } from '@/hooks/safe-apps/useSafeAppFromBackend'
import { useSafeAppFromManifest } from '@/hooks/safe-apps/useSafeAppFromManifest'
import { SafeAppDetails } from '@/components/safe-apps/SafeAppLandingPage/SafeAppDetails'
import { TryDemo } from '@/components/safe-apps/SafeAppLandingPage/TryDemo'
import { AppActions } from '@/components/safe-apps/SafeAppLandingPage/AppActions'
import useWallet from '@/hooks/wallets/useWallet'
import { AppRoutes } from '@/config/routes'
import { SAFE_APPS_DEMO_SAFE_MAINNET } from '@/config/constants'
import useOnboard from '@/hooks/wallets/useOnboard'
import { Errors, logError } from '@/services/exceptions'
import useOwnedSafes from '@/hooks/useOwnedSafes'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'

type Props = {
  appUrl: string
  chainId: string
}

const CHAIN_ID_WITH_A_DEMO = '1'

const SafeAppLanding = ({ appUrl, chainId }: Props) => {
  const { safeApp, isLoading } = useSafeAppFromManifest(appUrl, chainId)
  const [backendApp, , backendAppLoading] = useSafeAppFromBackend(appUrl, chainId)
  const wallet = useWallet()
  const onboard = useOnboard()
  const ownedSafes = useOwnedSafes()[chainId] ?? []
  const chain = useAppSelector((state) => selectChainById(state, chainId))
  // show demo if the app was shared for mainnet or we can find the mainnet chain id on the backend
  const showDemo = chainId === CHAIN_ID_WITH_A_DEMO || !!backendApp?.chainIds.includes(CHAIN_ID_WITH_A_DEMO)

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

  const handleConnectWallet = async () => {
    if (!onboard) return

    trackEvent(OVERVIEW_EVENTS.OPEN_ONBOARD)

    onboard.connectWallet().catch((e) => logError(Errors._302, (e as Error).message))
  }

  const handleDemoClick = () => {
    trackEvent({ ...SAFE_APPS_EVENTS.SHARED_APP_OPEN_DEMO, label: appUrl })
  }

  if (isLoading || backendAppLoading) {
    return <div>Loading...</div>
  }

  if (!safeApp) {
    return <div>No safe app found</div>
  }

  return (
    <Grid container>
      <Grid sm={12} md={12} lg={8} lgOffset={2} xl={6} xlOffset={3}>
        <Paper sx={{ p: 6 }}>
          <SafeAppDetails app={backendApp || safeApp} showDefaultListWarning={!backendApp} />
          <Grid container sx={{ mt: 4 }} rowSpacing={{ xs: 2, sm: 2 }}>
            <Grid xs={12} sm={12} md={showDemo ? 6 : 12}>
              <AppActions
                appUrl={appUrl}
                wallet={wallet}
                onConnectWallet={handleConnectWallet}
                safes={ownedSafes}
                chainId={chainId}
                chainPrefix={chain?.shortName}
              />
            </Grid>
            {showDemo && (
              <Grid xs={12} sm={12} md={6}>
                <TryDemo
                  demoUrl={`${AppRoutes.safe.apps}?safe=${SAFE_APPS_DEMO_SAFE_MAINNET}&appUrl=${appUrl}`}
                  onClick={handleDemoClick}
                />
              </Grid>
            )}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  )
}

export { SafeAppLanding }
