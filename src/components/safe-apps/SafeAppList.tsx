import { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { SafeAppsSection } from './SafeAppsSection'
import { useAppsSearch } from '@/hooks/safe-apps/useAppsSearch'
import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import { SafeAppsHeader } from './SafeAppsHeader'
import { useRemoveAppModal } from '@/hooks/safe-apps/useRemoveAppModal'
import useDebounce from '@/hooks/useDebounce'
import { RemoveCustomAppModal } from '@/components/safe-apps/RemoveCustomAppModal'
import { SAFE_APPS_EVENTS, trackSafeAppEvent } from '@/services/analytics'
import SafeAppsSearchPlaceholder from './SafeAppsSearchPlaceholder'

const SafeAppList = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const {
    allSafeApps,
    pinnedSafeApps,
    pinnedSafeAppIds,
    remoteSafeAppsLoading,
    customSafeAppsLoading,
    addCustomApp,
    removeCustomApp,
    customSafeApps,
    togglePin,
  } = useSafeApps()
  const filteredApps = useAppsSearch(allSafeApps, searchQuery)
  const { state: removeCustomAppModalState, open: openRemoveAppModal, close } = useRemoveAppModal()

  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  useEffect(() => {
    if (debouncedSearchQuery) {
      trackSafeAppEvent({ ...SAFE_APPS_EVENTS.SEARCH, label: debouncedSearchQuery })
    }
  }, [debouncedSearchQuery])

  const handleCustomAppRemoval = (appId: number) => {
    removeCustomApp(appId)
    close()
  }

  let pageBody = (
    <>
      <SafeAppsSection
        collapsible
        title={`Pinned apps (${pinnedSafeApps.length})`}
        apps={pinnedSafeApps}
        allApps={allSafeApps}
        onPinApp={togglePin}
        pinnedIds={pinnedSafeAppIds}
        cardVariant="compact"
      />
      <SafeAppsSection
        collapsible
        title={`Custom apps (${customSafeApps.length})`}
        apps={customSafeApps}
        allApps={allSafeApps}
        onDeleteApp={openRemoveAppModal}
        prependAddCustomAppCard
        onAddCustomApp={addCustomApp}
      />
      <SafeAppsSection
        title={`All (${allSafeApps.length})`}
        apps={allSafeApps}
        allApps={allSafeApps}
        onPinApp={togglePin}
        pinnedIds={pinnedSafeAppIds}
      />
    </>
  )
  if (searchQuery) {
    if (filteredApps.length === 0) {
      pageBody = <SafeAppsSearchPlaceholder searchQuery={searchQuery} />
    } else {
      pageBody = (
        <SafeAppsSection title={`Search results (${filteredApps.length})`} apps={filteredApps} allApps={allSafeApps} />
      )
    }
  }

  return (
    <>
      <SafeAppsHeader searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />

      <main style={{ padding: 0 }}>
        <Grid container direction="column">
          {remoteSafeAppsLoading || customSafeAppsLoading ? (
            <Typography variant="body1" p={2}>
              Loading...
            </Typography>
          ) : (
            pageBody
          )}

          {removeCustomAppModalState.app && (
            <RemoveCustomAppModal
              open={removeCustomAppModalState.isOpen}
              app={removeCustomAppModalState.app}
              onClose={close}
              onConfirm={handleCustomAppRemoval}
            />
          )}
        </Grid>
      </main>
    </>
  )
}

export { SafeAppList }
