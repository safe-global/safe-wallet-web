import * as React from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import { SafeAppsHeader } from '@/components/safe-apps/SafeAppsHeader'
import { IS_PRODUCTION } from '@/config/constants'
import { Typography } from '@mui/material'
import { SafeAppsList } from '@/components/safe-apps/SafeAppsList'
import { useAppsSearch } from '@/hooks/safe-apps/useAppsSearch'

const Apps: NextPage = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const { allSafeApps, remoteSafeAppsLoading, customSafeAppsLoading, addCustomApp, customSafeApps } = useSafeApps()
  const filteredApps = useAppsSearch(allSafeApps, searchQuery)

  let pageBody = (
    <SafeAppsList
      loading={remoteSafeAppsLoading || customSafeAppsLoading}
      customApps={customSafeApps}
      allApps={filteredApps}
      hideAddCustomApp={searchQuery.length > 0}
      onAddCustomApp={addCustomApp}
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
