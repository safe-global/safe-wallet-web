import { useEffect } from 'react'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Unstable_Grid2'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { SAFE_APPS_EVENTS, trackEvent } from '@/services/analytics'
import { useSafeAppFromManifest } from '@/hooks/safe-apps/useSafeAppFromManifest'
import Typography from '@mui/material/Typography'
import { Box } from '@mui/system'

type Props = {
  appUrl: string
  chainId: string
}

type DetailsProps = {
  app: SafeAppData
}

const SafeAppDetails = ({ app }: DetailsProps) => {
  return (
    <Paper sx={{ p: 6 }}>
      <Box sx={{ display: 'flex' }}>
        <img src={app.iconUrl} alt={app.name} width={90} height={90} />
        <Box sx={{ ml: 8 }}>
          <Typography variant="h4">{app.name}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {app.description}
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

const SafeAppLanding = ({ appUrl, chainId }: Props) => {
  const { safeApp, isLoading } = useSafeAppFromManifest(appUrl, chainId)

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

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!safeApp) {
    return <div>No safe app found</div>
  }

  return (
    <Grid container>
      <Grid xs md={6} mdOffset={3}>
        <SafeAppDetails app={safeApp} />
      </Grid>
    </Grid>
  )
}

export { SafeAppLanding }
