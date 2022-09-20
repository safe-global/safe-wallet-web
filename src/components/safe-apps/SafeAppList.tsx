import { useState } from 'react'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { SafeAppsSection } from './SafeAppsSection'
import { useAppsSearch } from '@/hooks/safe-apps/useAppsSearch'
import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import { SafeAppsHeader } from './SafeAppsHeader'
import { useRemoveAppModal } from '@/hooks/safe-apps/useRemoveAppModal'
import { RemoveCustomAppModal } from '@/components/safe-apps/RemoveCustomAppModal'

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
        onPinApp={togglePin}
        pinnedIds={pinnedSafeAppIds}
        cardVariant="compact"
      />
      <SafeAppsSection
        collapsible
        title={`Custom apps (${customSafeApps.length})`}
        apps={customSafeApps}
        onDeleteApp={openRemoveAppModal}
        prependAddCustomAppCard
        onAddCustomApp={addCustomApp}
      />
      <SafeAppsSection
        title={`All (${allSafeApps.length})`}
        apps={allSafeApps}
        onPinApp={togglePin}
        pinnedIds={pinnedSafeAppIds}
      />
    </>
  )
  if (searchQuery) {
    if (filteredApps.length === 0) {
      pageBody = (
        <Typography variant="body1" sx={{ p: 2 }}>
          No apps found
        </Typography>
      )
    } else {
      pageBody = <SafeAppsSection title={`Search results (${filteredApps.length})`} apps={filteredApps} />
    }
  }

  return (
    <Grid container direction="column">
      <SafeAppsHeader searchQuery={searchQuery} onSearchQueryChange={setSearchQuery} />

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
  )
}

export { SafeAppList }
