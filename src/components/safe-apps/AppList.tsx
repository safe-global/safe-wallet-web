import { IS_PRODUCTION } from '@/config/constants'
import { Grid } from '@mui/material'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import { AppCard } from './AppCard'
import { SafeAppsHeader } from './SafeAppsHeader'

const AppList = () => {
  const { allSafeApps, remoteSafeAppsLoading, customSafeAppsLoading, addCustomApp } = useSafeApps()

  if (remoteSafeAppsLoading || customSafeAppsLoading) {
    return <p>Loading...</p>
  }

  return (
    <>
      {!IS_PRODUCTION && <SafeAppsHeader onCustomAppSave={addCustomApp} safeAppList={allSafeApps} />}

      <Grid
        container
        rowSpacing={2}
        columnSpacing={2}
        sx={{
          p: 3,
        }}
      >
        {allSafeApps.map((a: SafeAppData) => (
          <Grid key={a.id || a.url} item xs={12} sm={6} md={3} xl={1.5}>
            <AppCard safeApp={a} />
          </Grid>
        ))}
      </Grid>
    </>
  )
}

export default AppList
