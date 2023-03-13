import { useState, useCallback } from 'react'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import classnames from 'classnames'

import SafeAppsFilters from '@/components/safe-apps/SafeAppsFilters'
import SafeAppCard, { GRID_VIEW_MODE } from '@/components/safe-apps/SafeAppCard'
import type { SafeAppsViewMode } from '@/components/safe-apps/SafeAppCard'
import AddCustomSafeAppCard from '@/components/safe-apps/AddCustomSafeAppCard'
import SafeAppPreviewDrawer from '@/components/safe-apps/SafeAppPreviewDrawer'
import SafeAppsListHeader from '@/components/safe-apps/SafeAppsListHeader'
import SafeAppsZeroResultsPlaceholder from '@/components/safe-apps/SafeAppsZeroResultsPlaceholder'
import useSafeAppsFilters from '@/hooks/safe-apps/useSafeAppsFilters'
import useSafeAppPreviewDrawer from '@/hooks/safe-apps/useSafeAppPreviewDrawer'
import css from './styles.module.css'
import { Skeleton } from '@mui/material'

type SafeAppListProps = {
  safeAppsList: SafeAppData[]
  safeAppsListLoading?: boolean
  bookmarkedSafeAppsId?: Set<number>
  onBookmarkSafeApp?: (safeAppId: number) => void
  showFilters?: boolean
  addCustomApp?: (safeApp: SafeAppData) => void
  removeCustomApp?: (safeApp: SafeAppData) => void
}

const SafeAppList = ({
  safeAppsList,
  safeAppsListLoading,
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

  const handleSafeAppClick = useCallback(
    (safeApp: SafeAppData) => {
      const isCustomApp = safeApp.id < 1

      if (isCustomApp) return

      return () => openPreviewDrawer(safeApp)
    },
    [openPreviewDrawer],
  )

  return (
    <>
      {/* Safe Apps Filters */}
      {showFilters && (
        <SafeAppsFilters
          onChangeQuery={setQuery}
          onChangeFilterCategory={setSelectedCategories}
          onChangeOptimizedWithBatch={setOptimizedWithBatchFilter}
          selectedCategories={selectedCategories}
          safeAppsList={safeAppsList}
        />
      )}

      {/* Safe Apps List Header */}
      <SafeAppsListHeader
        amount={filteredApps.length}
        safeAppsViewMode={safeAppsViewMode}
        setSafeAppsViewMode={setSafeAppsViewMode}
      />

      {/* Safe App List */}
      <ul
        className={classnames(
          css.safeAppsContainer,
          safeAppsViewMode === GRID_VIEW_MODE ? css.safeAppsGridViewContainer : css.safeAppsListViewContainer,
        )}
      >
        {/* Add Custom Safe App Card */}
        {addCustomApp && (
          <li>
            <AddCustomSafeAppCard safeAppList={safeAppsList} onSave={addCustomApp} />
          </li>
        )}

        {safeAppsListLoading &&
          Array.from({ length: 8 }, (_, index) => (
            <li key={index}>
              <Skeleton variant="rounded" height="271px" />
            </li>
          ))}

        {filteredApps.map((safeApp) => {
          return (
            <li key={safeApp.id}>
              <SafeAppCard
                safeApp={safeApp}
                viewMode={safeAppsViewMode}
                isBookmarked={bookmarkedSafeAppsId?.has(safeApp.id)}
                onBookmarkSafeApp={onBookmarkSafeApp}
                removeCustomApp={removeCustomApp}
                onClickSafeApp={handleSafeAppClick(safeApp)}
              />
            </li>
          )
        })}
      </ul>

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
