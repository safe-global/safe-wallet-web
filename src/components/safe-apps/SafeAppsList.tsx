import * as React from 'react'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import Grid from '@mui/material/Grid'
import { AddCustomAppCard } from '@/components/safe-apps/AddCustomAppCard'
import { AppCard } from '@/components/safe-apps/AppCard'
import { Typography } from '@mui/material'
import { CollapsibleSection } from './CollapsibleSection'

type Props = {
  loading: boolean
  allApps: SafeAppData[]
  customApps: SafeAppData[]
  hideAddCustomApp?: boolean
  onAddCustomApp: (app: SafeAppData) => void
}

const SafeAppsList = ({ loading, allApps, customApps, hideAddCustomApp, onAddCustomApp }: Props) => {
  if (loading) {
    return <Typography variant="body1">Loading...</Typography>
  }

  return (
    <Grid container direction="column">
      <CollapsibleSection title="CUSTOM APPS" apps={customApps} />

      <Grid
        container
        rowSpacing={2}
        columnSpacing={2}
        sx={{
          p: 3,
        }}
      >
        <Grid item xs={12}>
          <Typography variant="caption" fontWeight={700} sx={({ palette }) => ({ color: palette.secondary.light })}>
            ALL ({allApps.length})
          </Typography>
        </Grid>
        {!hideAddCustomApp && (
          <Grid item xs={12} sm={6} md={3} xl={1.5}>
            <AddCustomAppCard onSave={onAddCustomApp} safeAppList={allApps} />
          </Grid>
        )}

        {allApps.map((a) => (
          <Grid key={a.id || a.url} item xs={12} sm={6} md={3} xl={1.5}>
            <AppCard safeApp={a} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  )
}

export { SafeAppsList }
