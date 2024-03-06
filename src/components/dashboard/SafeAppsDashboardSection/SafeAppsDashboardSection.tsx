import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'

import SafeAppCard, { SafeAppCardContainer } from '@/components/safe-apps/SafeAppCard'
import SafeAppPreviewDrawer from '@/components/safe-apps/SafeAppPreviewDrawer'
import { AppRoutes } from '@/config/routes'
import useSafeAppPreviewDrawer from '@/hooks/safe-apps/useSafeAppPreviewDrawer'
import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import ExploreSafeAppsIcon from '@/public/images/apps/explore.svg'
import { WidgetContainer } from '../styled'

import css from './styles.module.css'

const SafeAppsDashboardSection = () => {
  const { rankedSafeApps, togglePin, pinnedSafeAppIds } = useSafeApps()
  const { isPreviewDrawerOpen, previewDrawerApp, openPreviewDrawer, closePreviewDrawer } = useSafeAppPreviewDrawer()

  return (
    <WidgetContainer>
      <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
        Safe Apps
      </Typography>

      <Grid container spacing={3}>
        {rankedSafeApps.map((rankedSafeApp) => (
          <Grid key={rankedSafeApp.id} item xs={12} sm={6} md={4} xl={4}>
            <SafeAppCard
              safeApp={rankedSafeApp}
              onBookmarkSafeApp={togglePin}
              isBookmarked={pinnedSafeAppIds.has(rankedSafeApp.id)}
              onClickSafeApp={() => openPreviewDrawer(rankedSafeApp)}
              openPreviewDrawer={openPreviewDrawer}
            />
          </Grid>
        ))}

        <Grid item xs={12} sm={6} md={4} xl={4}>
          <ExploreSafeAppsCard />
        </Grid>
      </Grid>

      <SafeAppPreviewDrawer
        isOpen={isPreviewDrawerOpen}
        safeApp={previewDrawerApp}
        isBookmarked={previewDrawerApp && pinnedSafeAppIds.has(previewDrawerApp.id)}
        onClose={closePreviewDrawer}
        onBookmark={togglePin}
      />
    </WidgetContainer>
  )
}

export default SafeAppsDashboardSection

const ExploreSafeAppsCard = () => {
  const router = useRouter()
  const safeAppsLink = `${AppRoutes.apps.index}?safe=${router.query.safe}`

  return (
    <SafeAppCardContainer safeAppUrl={safeAppsLink} className={css.container}>
      <ExploreSafeAppsIcon alt="Explore Safe Apps icon" />

      <Button data-sid="77003" data-testid="explore-apps-btn" variant="contained" size="small">
        Explore Safe Apps
      </Button>
    </SafeAppCardContainer>
  )
}
