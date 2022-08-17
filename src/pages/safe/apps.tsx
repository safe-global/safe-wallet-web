import * as React from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import Grid from '@mui/material/Grid'
import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import { AppCard } from '@/components/safe-apps/AppCard'
import { SafeAppsHeader } from '@/components/safe-apps/SafeAppsHeader'
import { IS_PRODUCTION } from '@/config/constants'
import { AddCustomAppCard } from '@/components/safe-apps/AddCustomAppCard'
import { Typography } from '@mui/material'
import { SafeAppsList } from '@/components/safe-apps/SafeAppsList'

const Apps: NextPage = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const { allSafeApps, remoteSafeAppsLoading, customSafeAppsLoading, addCustomApp } = useSafeApps()
  const filteredApps = React.useMemo(
    () => allSafeApps.filter((app) => app.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery, allSafeApps],
  )

  let pageBody = (
    <SafeAppsList
      loading={remoteSafeAppsLoading || customSafeAppsLoading}
      apps={filteredApps}
      hideAddCustomApp={searchQuery.length > 0}
    />
  )
  if (searchQuery && filteredApps.length === 0) {
    pageBody = (
      <Typography variant="body1" sx={{ p: 2 }}>
        No apps found
      </Typography>
    )
  }

  return (
    <main style={{ padding: 0 }}>
      <Head>
        <title>Safe Apps</title>
      </Head>

      {!IS_PRODUCTION && <SafeAppsHeader searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />}

      {pageBody}
    </main>
  )
}

export default Apps
