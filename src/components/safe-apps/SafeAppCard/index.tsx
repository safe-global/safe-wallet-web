import Link from 'next/link'
import { useRouter } from 'next/router'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CardActions from '@mui/material/CardActions'
import Box from '@mui/material/Box'
import { resolveHref } from 'next/dist/shared/lib/router/router'
import classNames from 'classnames'
import type { ReactNode, SyntheticEvent } from 'react'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import type { NextRouter } from 'next/router'
import type { UrlObject } from 'url'

import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import SafeAppActionButtons from '@/components/safe-apps/SafeAppActionButtons'
import SafeAppTags from '@/components/safe-apps/SafeAppTags'
import { isOptimizedForBatchTransactions } from '@/components/safe-apps/utils'
import { AppRoutes } from '@/config/routes'
import BatchIcon from '@/public/images/apps/batch-icon.svg'
import css from './styles.module.css'

export type SafeAppsViewMode = 'list-view' | 'grid-view'

export const GRID_VIEW_MODE: SafeAppsViewMode = 'grid-view' // default view
export const LIST_VIEW_MODE: SafeAppsViewMode = 'list-view'

type SafeAppCardProps = {
  safeApp: SafeAppData
  onClickSafeApp?: () => void
  viewMode?: SafeAppsViewMode
  isBookmarked?: boolean
  onBookmarkSafeApp?: (safeAppId: number) => void
  removeCustomApp?: (safeApp: SafeAppData) => void
}

const SafeAppCard = ({
  safeApp,
  onClickSafeApp,
  viewMode,
  isBookmarked,
  onBookmarkSafeApp,
  removeCustomApp,
}: SafeAppCardProps) => {
  const router = useRouter()

  const safeAppUrl = getSafeAppUrl(router, safeApp.url)

  const isListViewMode = viewMode === LIST_VIEW_MODE

  if (isListViewMode) {
    return (
      <SafeAppCardListView
        safeApp={safeApp}
        safeAppUrl={safeAppUrl}
        isBookmarked={isBookmarked}
        onBookmarkSafeApp={onBookmarkSafeApp}
        removeCustomApp={removeCustomApp}
        onClickSafeApp={onClickSafeApp}
      />
    )
  }

  // Grid view as fallback
  return (
    <SafeAppCardGridView
      safeApp={safeApp}
      safeAppUrl={safeAppUrl}
      isBookmarked={isBookmarked}
      onBookmarkSafeApp={onBookmarkSafeApp}
      removeCustomApp={removeCustomApp}
      onClickSafeApp={onClickSafeApp}
    />
  )
}

export default SafeAppCard

export const getSafeAppUrl = (router: NextRouter, safeAppUrl: string) => {
  const shareUrlObj: UrlObject = {
    pathname: AppRoutes.apps.open,
    query: { safe: router.query.safe, appUrl: safeAppUrl },
  }

  return resolveHref(router, shareUrlObj)
}

type SafeAppCardViewProps = {
  safeApp: SafeAppData
  onClickSafeApp?: () => void
  safeAppUrl: string
  isBookmarked?: boolean
  onBookmarkSafeApp?: (safeAppId: number) => void
  removeCustomApp?: (safeApp: SafeAppData) => void
}

const SafeAppCardGridView = ({
  safeApp,
  onClickSafeApp,
  safeAppUrl,
  isBookmarked,
  onBookmarkSafeApp,
  removeCustomApp,
}: SafeAppCardViewProps) => {
  return (
    <SafeAppCardContainer safeAppUrl={safeAppUrl} onClickSafeApp={onClickSafeApp} height={'100%'}>
      {/* Safe App Header */}
      <CardHeader
        className={css.safeAppHeader}
        avatar={
          <div className={css.safeAppIconContainer}>
            {/* Batch transactions Icon */}
            {isOptimizedForBatchTransactions(safeApp) && (
              <BatchIcon className={css.safeAppBatchIcon} alt="batch transactions icon" />
            )}

            {/* Safe App Icon */}
            <SafeAppIconCard src={safeApp.iconUrl} alt={`${safeApp.name} logo`} />
          </div>
        }
        action={
          <>
            {/* Safe App Action Buttons */}
            <SafeAppActionButtons
              safeApp={safeApp}
              isBookmarked={isBookmarked}
              onBookmarkSafeApp={onBookmarkSafeApp}
              removeCustomApp={removeCustomApp}
            />
          </>
        }
      />

      <CardContent className={css.safeAppContent}>
        {/* Safe App Title */}
        <Typography className={css.safeAppTitle} gutterBottom variant="h5">
          {safeApp.name}
        </Typography>

        {/* Safe App Description */}
        <Typography className={css.safeAppDescription} variant="body2" color="text.secondary">
          {safeApp.description}
        </Typography>

        {/* Safe App Tags */}
        <SafeAppTags tags={safeApp.tags} />
      </CardContent>
    </SafeAppCardContainer>
  )
}

const SafeAppCardListView = ({
  safeApp,
  onClickSafeApp,
  safeAppUrl,
  isBookmarked,
  onBookmarkSafeApp,
  removeCustomApp,
}: SafeAppCardViewProps) => {
  return (
    <SafeAppCardContainer safeAppUrl={safeAppUrl} onClickSafeApp={onClickSafeApp}>
      <CardContent sx={{ pb: '16px !important' }}>
        <Box display="flex" flexDirection="row" alignItems="center" gap={2}>
          <div className={css.safeAppIconContainer}>
            {/* Batch transactions Icon */}
            {isOptimizedForBatchTransactions(safeApp) && (
              <BatchIcon className={css.safeAppBatchIcon} alt="batch transactions icon" />
            )}

            {/* Safe App Icon */}
            <SafeAppIconCard src={safeApp.iconUrl} alt={`${safeApp.name} logo`} />
          </div>

          {/* Safe App Title */}
          <Typography className={css.safeAppTitle} gutterBottom variant="h5">
            {safeApp.name}
          </Typography>

          {/* Safe App Action Buttons */}
          <CardActions>
            <SafeAppActionButtons
              safeApp={safeApp}
              isBookmarked={isBookmarked}
              onBookmarkSafeApp={onBookmarkSafeApp}
              removeCustomApp={removeCustomApp}
            />
          </CardActions>
        </Box>
      </CardContent>
    </SafeAppCardContainer>
  )
}

type SafeAppCardContainerProps = {
  onClickSafeApp?: () => void
  safeAppUrl: string
  children: ReactNode
  height?: string
  className?: string
}

export const SafeAppCardContainer = ({
  children,
  safeAppUrl,
  onClickSafeApp,
  height,
  className,
}: SafeAppCardContainerProps) => {
  const handleClickSafeApp = (event: SyntheticEvent) => {
    if (onClickSafeApp) {
      event.preventDefault()
      onClickSafeApp()
    }
  }

  return (
    <Link href={safeAppUrl} passHref>
      <a rel="noreferrer" onClick={handleClickSafeApp}>
        <Card className={classNames(css.safeAppContainer, className)} sx={{ height }}>
          {children}
        </Card>
      </a>
    </Link>
  )
}
