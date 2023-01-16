import { useState } from 'react'
import Grid from '@mui/material/Grid'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'

import SafeAppsFilters from '@/components/new-safe-apps/SafeAppsFilters/SafeAppsFilters'
import SafeAppCard, { GRID_VIEW_MODE, LIST_VIEW_MODE } from '@/components/new-safe-apps/SafeAppCard/SafeAppCard'
import type { SafeAppsViewMode } from '@/components/new-safe-apps/SafeAppCard/SafeAppCard'
import AddCustomSafeAppCard from '@/components/new-safe-apps/AddCustomSafeAppCard/AddCustomSafeAppCard'
import SafeAppPreviewDrawer from '@/components/new-safe-apps/SafeAppPreviewDrawer/SafeAppPreviewDrawer'
import SafeAppsListHeader from '@/components/new-safe-apps/SafeAppsListHeader/SafeAppsListHeader'
import SafeAppsZeroResultsPlaceholder from '@/components/new-safe-apps/SafeAppsZeroResultsPlaceholder/SafeAppsZeroResultsPlaceholder'
import useSafeAppsFilters from '@/hooks/safe-apps/useSafeAppsFilters'
import useSafeAppPreviewDrawer from '@/hooks/safe-apps/useSafeAppPreviewDrawer'

type SafeAppListProps = {
  safeAppsList: SafeAppData[]
  bookmarkedSafeAppsId?: Set<number>
  onBookmarkSafeApp?: (safeAppId: number) => void
  showFilters?: boolean
  addCustomApp?: (safeApp: SafeAppData) => void
  removeCustomApp?: (safeAppId: number) => void
}

const SafeAppList = ({
  safeAppsList,
  bookmarkedSafeAppsId,
  onBookmarkSafeApp,
  showFilters,
  addCustomApp,
  removeCustomApp,
}: SafeAppListProps) => {
  const [safeAppsViewMode, setSafeAppsViewMode] = useState<SafeAppsViewMode>(GRID_VIEW_MODE)
  const { isPreviewDrawerOpen, previewDrawerApp, openPreviewDrawer, closePreviewDrawer } = useSafeAppPreviewDrawer()

  const { filteredApps, query, setQuery, setSelectedCategories, setOptimizedWithBatchFilter, selectedCategories } =
    useSafeAppsFilters(safeAppsList)

  const showZeroResultsPlaceholder = query && filteredApps.length === 0

  return (
    <>
      {/* Safe Apps Filters */}
      {showFilters && (
        <SafeAppsFilters
          onChangeQuery={setQuery}
          onChangeFilterCategory={setSelectedCategories}
          onChangeOptimizedWithBatch={setOptimizedWithBatchFilter}
          selectedCategories={selectedCategories}
        />
      )}

      {/* Safe Apps List Header */}
      <SafeAppsListHeader
        amount={filteredApps.length}
        safeAppsViewMode={safeAppsViewMode}
        setSafeAppsViewMode={setSafeAppsViewMode}
      />

      {safeAppsViewMode === GRID_VIEW_MODE ? (
        // Safe Apps Grid view
        <Grid container rowSpacing={3} columnSpacing={3} component="ul" sx={{ listStyleType: 'none', padding: 0 }}>
          {/* Add Custom Safe App Card */}
          {addCustomApp && (
            <Grid item xs={12} sm={6} md={4} xl={3} component="li">
              <AddCustomSafeAppCard safeAppList={safeAppsList} onSave={addCustomApp} />
            </Grid>
          )}

          {filteredApps.map((safeApp) => {
            return (
              <Grid key={safeApp.id} item xs={12} sm={6} md={4} xl={3} component="li">
                <SafeAppCard
                  safeApp={safeApp}
                  viewMode={GRID_VIEW_MODE}
                  isBookmarked={bookmarkedSafeAppsId?.has(safeApp.id)}
                  onBookmarkSafeApp={onBookmarkSafeApp}
                  removeCustomApp={removeCustomApp}
                  onClickSafeApp={() => openPreviewDrawer(safeApp)}
                />
              </Grid>
            )
          })}
        </Grid>
      ) : (
        // Safe Apps List view
        <Grid container rowSpacing={2} columnSpacing={2} component="ul" sx={{ listStyleType: 'none', padding: 0 }}>
          {filteredApps.map((safeApp) => {
            return (
              <Grid key={safeApp.id} item xs={12} md={6} xl={4} component="li">
                <SafeAppCard
                  safeApp={safeApp}
                  viewMode={LIST_VIEW_MODE}
                  isBookmarked={bookmarkedSafeAppsId?.has(safeApp.id)}
                  onBookmarkSafeApp={onBookmarkSafeApp}
                  removeCustomApp={removeCustomApp}
                  onClickSafeApp={() => openPreviewDrawer(safeApp)}
                />
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Zero results placeholder */}
      {showZeroResultsPlaceholder && <SafeAppsZeroResultsPlaceholder searchQuery={query} />}

      {/* Safe App Preview Drawer */}
      <SafeAppPreviewDrawer
        isOpen={isPreviewDrawerOpen}
        safeApp={previewDrawerApp}
        isBookmarked={previewDrawerApp && bookmarkedSafeAppsId?.has(previewDrawerApp.id)}
        onClose={closePreviewDrawer}
        onBookmark={onBookmarkSafeApp}
      />
    </>
  )
}

export default SafeAppList
