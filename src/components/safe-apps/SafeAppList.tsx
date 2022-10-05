import { useEffect, useMemo, useState } from 'react'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { SafeAppsSection } from './SafeAppsSection'
import { useAppsSearch } from '@/hooks/safe-apps/useAppsSearch'
import { useSafeApps } from '@/hooks/safe-apps/useSafeApps'
import { SafeAppsHeader } from './SafeAppsHeader'
import { useRemoveAppModal } from '@/hooks/safe-apps/useRemoveAppModal'
import useDebounce from '@/hooks/useDebounce'
import { RemoveCustomAppModal } from '@/components/safe-apps/RemoveCustomAppModal'
import { SAFE_APPS_EVENTS, trackEvent } from '@/services/analytics'
import PagePlaceholder from '../common/PagePlaceholder'
import { Button } from '@mui/material'
import AddCustomAppIcon from '@/public/images/apps/add-custom-app.svg'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import Link from 'next/link'
import type { LinkProps } from 'next/link'

const SafeAppList = () => {
  const router = useRouter()
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

  const wcLink: LinkProps['href'] = useMemo(() => {
    const WC_APP_NAME = 'WalletConnect'

    const wc = allSafeApps.find((app) => app.name === WC_APP_NAME)

    if (!wc) {
      return ''
    }

    return {
      pathname: AppRoutes.apps,
      query: {
        safe: router.query.safe,
        appUrl: wc.url,
      },
    }
  }, [allSafeApps, router.query.safe])

  useEffect(() => {
    if (debouncedSearchQuery) {
      trackEvent({ ...SAFE_APPS_EVENTS.SEARCH, label: debouncedSearchQuery })
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
        <PagePlaceholder
          img={<AddCustomAppIcon />}
          text={
            <Typography variant="body1" color="primary.light" m={2}>
              No apps found matching <strong>{searchQuery}</strong>. Connect to dApps that haven&apos;t yet been
              integrated with the Safe using the WalletConnect App.
            </Typography>
          }
        >
          <Link href={wcLink} passHref>
            <Button variant="contained" disableElevation size="small">
              Use WalletConnect
            </Button>
          </Link>
        </PagePlaceholder>
      )
    } else {
      pageBody = <SafeAppsSection title={`Search results (${filteredApps.length})`} apps={filteredApps} />
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
