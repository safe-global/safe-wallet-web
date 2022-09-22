import { useRouter } from 'next/router'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

import { WidgetContainer } from '../styled'
import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import { AppCard, AppCardContainer } from '@/components/safe-apps/AppCard'
import { AppRoutes } from '@/config/routes'

const SafeAppsDashboardSection = () => {
  const { rankedSafeApps } = useSafeApps()

  return (
    <WidgetContainer>
      <Typography component="h2" variant="h2" gutterBottom>
        Safe Apps
      </Typography>

      <Grid container rowSpacing={2} columnSpacing={2}>
        {rankedSafeApps.map((rankedSafeApp) => (
          <Grid key={rankedSafeApp.id} item xs={12} sm={6} md={4} xl={4}>
            <AppCard safeApp={rankedSafeApp} />
          </Grid>
        ))}

        <Grid item xs={12} sm={6} md={4} xl={4}>
          <ExploreSafeAppsCard />
        </Grid>
      </Grid>
    </WidgetContainer>
  )
}

export default SafeAppsDashboardSection

const ExploreSafeAppsCard = () => {
  const router = useRouter()
  const safeAppsLink = `${AppRoutes.apps}?safe=${router.query.safe}`

  return (
    <AppCardContainer url={safeAppsLink}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src="/images/explore.svg" alt="Add custom app icon" />

        <Button
          variant="contained"
          size="small"
          sx={{
            mt: 1,
          }}
        >
          Explore Safe Apps
        </Button>
      </Box>
    </AppCardContainer>
  )
}
