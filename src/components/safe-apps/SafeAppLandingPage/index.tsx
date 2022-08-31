import { useEffect } from 'react'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { Box } from '@mui/system'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Unstable_Grid2'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { SAFE_APPS_EVENTS, trackEvent } from '@/services/analytics'
import { useSafeAppFromBackend } from '@/hooks/safe-apps/useSafeAppFromBackend'
import { useSafeAppFromManifest } from '@/hooks/safe-apps/useSafeAppFromManifest'

type Props = {
  appUrl: string
  chainId: string
}

type DetailsProps = {
  app: SafeAppData
  showDefaultListWarning: boolean
}

const SafeAppDetails = ({ app, showDefaultListWarning }: DetailsProps) => {
  return (
    <Paper sx={{ p: 6 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', mb: 4 }}>
          <img src={app.iconUrl} alt={app.name} width={90} height={90} />
          <Box sx={{ ml: 8 }}>
            <Typography variant="h3" fontWeight={700}>
              {app.name}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {app.description}
            </Typography>
          </Box>
        </Box>
        <Divider />
        {showDefaultListWarning && (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mt: 4, mb: 4 }}>
              <Box sx={{ display: 'flex' }}>
                <WarningAmberIcon sx={({ palette }) => ({ color: palette.warning.dark })} />
                <Typography variant="h5" sx={({ palette }) => ({ color: palette.warning.dark })}>
                  Warning
                </Typography>
              </Box>
              <Typography variant="body1" sx={({ palette }) => ({ color: palette.warning.dark, mt: 1 })}>
                The application is not in the default Safe App list
              </Typography>
              <Typography variant="body2" sx={{ mt: 2 }}>
                Check the app link and ensure it comes from a trusted source
              </Typography>
              <Typography
                variant="body2"
                sx={({ palette }) => ({ mt: 2, backgroundColor: palette.primary.background, p: 1 })}
                fontWeight={700}
              >
                {app.url}
              </Typography>
            </Box>
            <Divider />
          </Box>
        )}
      </Box>
    </Paper>
  )
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
      <Grid xs md={6} mdOffset={3}>
        <SafeAppDetails app={safeApp} showDefaultListWarning={!backendApp} />
      </Grid>
    </Grid>
  )
}

export { SafeAppLanding }
