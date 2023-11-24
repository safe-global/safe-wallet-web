import { useCallback } from 'react'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import { motion, AnimatePresence } from 'framer-motion'

import SafeAppCard from '@/components/safe-apps/SafeAppCard'
import AddCustomSafeAppCard from '@/components/safe-apps/AddCustomSafeAppCard'
import SafeAppPreviewDrawer from '@/components/safe-apps/SafeAppPreviewDrawer'
import SafeAppsListHeader from '@/components/safe-apps/SafeAppsListHeader'
import SafeAppsZeroResultsPlaceholder from '@/components/safe-apps/SafeAppsZeroResultsPlaceholder'
import useSafeAppPreviewDrawer from '@/hooks/safe-apps/useSafeAppPreviewDrawer'
import css from './styles.module.css'
import { Skeleton } from '@mui/material'
import { useOpenedSafeApps } from '@/hooks/safe-apps/useOpenedSafeApps'

type SafeAppListProps = {
  safeAppsList: SafeAppData[]
  safeAppsListLoading?: boolean
  bookmarkedSafeAppsId?: Set<number>
  onBookmarkSafeApp?: (safeAppId: number) => void
  addCustomApp?: (safeApp: SafeAppData) => void
  removeCustomApp?: (safeApp: SafeAppData) => void
  title: string
  query?: string
}

const SafeAppList = ({
  safeAppsList,
  safeAppsListLoading,
  bookmarkedSafeAppsId,
  onBookmarkSafeApp,
  addCustomApp,
  removeCustomApp,
  title,
  query,
}: SafeAppListProps) => {
  const { isPreviewDrawerOpen, previewDrawerApp, openPreviewDrawer, closePreviewDrawer } = useSafeAppPreviewDrawer()
  const { openedSafeAppIds } = useOpenedSafeApps()

  const showZeroResultsPlaceholder = query && safeAppsList.length === 0

  const handleSafeAppClick = useCallback(
    (safeApp: SafeAppData) => {
      const isCustomApp = safeApp.id < 1

      if (isCustomApp || openedSafeAppIds.includes(safeApp.id)) return

      return () => openPreviewDrawer(safeApp)
    },
    [openPreviewDrawer, openedSafeAppIds],
  )

  return (
    <>
      {/* Safe Apps List Header */}
      <SafeAppsListHeader title={title} amount={safeAppsList.length} />

      {/* Safe Apps List */}
      <ul className={css.safeAppsContainer}>
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

        <AnimatePresence>
          {/* Flat list filtered by search query */}
          {safeAppsList.map((safeApp) => (
            <motion.li
              key={safeApp.id}
              layout
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SafeAppCard
                safeApp={safeApp}
                isBookmarked={bookmarkedSafeAppsId?.has(safeApp.id)}
                onBookmarkSafeApp={onBookmarkSafeApp}
                removeCustomApp={removeCustomApp}
                onClickSafeApp={handleSafeAppClick(safeApp)}
                openPreviewDrawer={openPreviewDrawer}
              />
            </motion.li>
          ))}
        </AnimatePresence>
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
