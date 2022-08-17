import * as React from 'react'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import Grid from '@mui/material/Grid'
import { AddCustomAppCard } from '@/components/safe-apps/AddCustomAppCard'
import { AppCard } from '@/components/safe-apps/AppCard'

type Props = {
  loading: boolean
  apps: SafeAppData[]
  hideAddCustomApp?: boolean
  onAddCustomApp: (app: SafeAppData) => void
}

const SafeAppsList = ({ loading, apps, hideAddCustomApp, onAddCustomApp }: Props) => {
  return (
    <Grid
      container
      rowSpacing={2}
      columnSpacing={2}
      sx={{
        p: 3,
      }}
    >
      {!hideAddCustomApp && (
        <Grid item xs={12} sm={6} md={3} xl={1.5}>
          <AddCustomAppCard onSave={onAddCustomApp} safeAppList={apps} />
        </Grid>
      )}

      {apps.map((a) => (
        <Grid key={a.id || a.url} item xs={12} sm={6} md={3} xl={1.5}>
          <AppCard safeApp={a} />
        </Grid>
      ))}
    </Grid>
  )
}

export { SafeAppsList }
