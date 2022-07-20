import type { NextPage } from 'next'
import Grid from '@mui/material/Grid'
import { useSafeApps } from '@/hooks/useSafeApps'
import { AppCard } from '@/components/safe-apps/AppCard'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import AppsIcon from '@/public/images/sidebar/apps.svg'
import { AddCustomAppCard } from '@/components/safe-apps/AddCustomAppCard'

const Apps: NextPage = () => {
  const [apps, error, loading] = useSafeApps()

  if (error) {
    return <p>Error: {error.message}</p>
  }

  if (loading || !apps) {
    return <p>Loading...</p>
  }

  return (
    <main>
      <Breadcrumbs Icon={AppsIcon} first="Apps" />
      <Grid container rowSpacing={2} columnSpacing={2}>
        <Grid item xs={12} sm={6} md={3} xl={1.5}>
          <AddCustomAppCard />
        </Grid>

        {apps.map((a) => (
          <Grid key={a.id || a.url} item xs={12} sm={6} md={3} xl={1.5}>
            <AppCard safeApp={a} />
          </Grid>
        ))}
      </Grid>
    </main>
  )
}

export default Apps
