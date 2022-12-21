import type { ReactElement, ReactNode, SyntheticEvent } from 'react'
import { useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import type { LinkProps } from 'next/link'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import type { IconButtonTypeMap } from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import ShareIcon from '@/public/images/common/share.svg'
import CopyButton from '@/components/common/CopyButton'
import BookmarkIcon from '@/public/images/apps/bookmark.svg'
import BookmarkedIcon from '@/public/images/apps/bookmarked.svg'
import DeleteIcon from '@/public/images/common/delete.svg'
import { AppRoutes } from '@/config/routes'
import styles from './styles.module.css'
import { useCurrentChain } from '@/hooks/useChains'
import { SvgIcon } from '@mui/material'
import type { UrlObject } from 'url'
import { resolveHref } from 'next/dist/shared/lib/router/router'
import { SAFE_APPS_EVENTS, trackSafeAppEvent } from '@/services/analytics'
import SafeAppIcon from '../SafeAppIcon'

export type SafeAppCardVariants = 'default' | 'compact'

type AppCardProps = {
  safeApp: SafeAppData
  pinned?: boolean
  onPin?: (appId: number) => void
  variant?: SafeAppCardVariants
  onDelete?: (app: SafeAppData) => void
}

type CompactSafeAppCardProps = {
  safeApp: SafeAppData
  url: LinkProps['href']
  pinned?: boolean
  onPin?: (appId: number) => void
  onShareClick?: (event: SyntheticEvent) => void
  shareUrl: string
}

type AppCardContainerProps = {
  url?: LinkProps['href']
  children: ReactNode
  variant?: SafeAppCardVariants
}

const enum AppCardVariantHeights {
  compact = '120px',
  default = '200px',
}

const enum AppCardVariantAspectRatio {
  compact = '1 / 1',
  default = 'auto',
}

const DeleteButton = ({ safeApp, onDelete }: { safeApp: SafeAppData; onDelete: (app: SafeAppData) => void }) => (
  <IconButton
    aria-label={`Delete ${safeApp.name}`}
    size="small"
    onClick={(event) => {
      event.preventDefault()
      event.stopPropagation()
      onDelete(safeApp)
    }}
  >
    <SvgIcon component={DeleteIcon} inheritViewBox fontSize="small" />
  </IconButton>
)

const ShareButton = ({
  className,
  shareUrl,
  safeApp,
}: {
  className?: string
  shareUrl: string
  safeApp: SafeAppData
}): ReactElement => {
  const handleCopy = useCallback(() => {
    const isCustomApp = safeApp.id < 1

    trackSafeAppEvent(SAFE_APPS_EVENTS.COPY_SHARE_URL, isCustomApp ? safeApp.url : safeApp.name)
  }, [safeApp])

  return (
    <CopyButton
      text={shareUrl}
      initialToolTipText={`Copy share URL for ${safeApp.name}`}
      className={className}
      onCopy={handleCopy}
    >
      <SvgIcon component={ShareIcon} inheritViewBox color="border" fontSize="small" />
    </CopyButton>
  )
}

const PinButton = ({
  pinned,
  safeApp,
  onPin,
  sx,
}: {
  pinned: boolean
  safeApp: SafeAppData
  onPin: (id: SafeAppData['id']) => void
  sx?: IconButtonTypeMap['props']['sx']
}) => (
  <IconButton
    aria-label={`${pinned ? 'Unpin' : 'Pin'} ${safeApp.name}`}
    size="small"
    onClick={(event) => {
      event.preventDefault()
      event.stopPropagation()
      onPin(safeApp.id)
    }}
    title={`${pinned ? 'Unpin' : 'Pin'} ${safeApp.name}`}
    sx={sx}
  >
    <SvgIcon
      component={pinned ? BookmarkedIcon : BookmarkIcon}
      inheritViewBox
      color={pinned ? 'primary' : undefined}
      fontSize="small"
    />
  </IconButton>
)

const AppCardContainer = ({ url, children, variant }: AppCardContainerProps): ReactElement => {
  const height = variant === 'compact' ? AppCardVariantHeights.compact : AppCardVariantHeights.default
  const aspectRatio = variant === 'compact' ? AppCardVariantAspectRatio.compact : AppCardVariantAspectRatio.default

  const card = (
    <Card
      sx={({ palette }) => ({
        height,
        aspectRatio,
        transition: 'background-color 0.3s ease-in-out, border 0.3s ease-in-out',
        border: '1px solid transparent',
        '&:hover': {
          backgroundColor: palette.background.light,
          border: `1px solid ${palette.secondary.light}`,
        },
      })}
    >
      {children}
    </Card>
  )

  if (url) {
    return (
      <Link href={url} passHref>
        <a rel="noreferrer">{card}</a>
      </Link>
    )
  }

  return card
}

const CompactAppCard = ({ url, safeApp, onPin, pinned, shareUrl }: CompactSafeAppCardProps): ReactElement => (
  <div className={styles.compactContainer}>
    <AppCardContainer url={url} variant="compact">
      <div className={styles.compactCardContainer}>
        {/* App logo */}
        <SafeAppIcon src={safeApp.iconUrl} alt={`${safeApp.name} logo`} />

        {/* TODO No share button per design. Only info button. Leaving the code for reusing the styles */}
        {/* Share button */}
        {/* <ShareButton className={styles.compactShareButton} shareUrl={shareUrl} safeApp={safeApp} /> */}

        {/* Pin/unpin button */}
        {onPin && (
          <PinButton
            pinned={Boolean(pinned)}
            safeApp={safeApp}
            onPin={onPin}
            sx={{ position: 'absolute', top: 2, right: 2 }}
          />
        )}
      </div>
    </AppCardContainer>
    <Typography gutterBottom variant="h5" className={styles.compactText}>
      {safeApp.name}
    </Typography>
  </div>
)

const AppCard = ({ safeApp, pinned, onPin, onDelete, variant = 'default' }: AppCardProps): ReactElement => {
  const router = useRouter()
  const currentChain = useCurrentChain()

  const shareUrlObj: UrlObject = {
    protocol: typeof window !== 'undefined' ? window.location.protocol : '',
    host: typeof window !== 'undefined' ? window.location.host : '',
    pathname: AppRoutes.share.safeApp,
    query: { appUrl: safeApp.url, chain: currentChain?.shortName },
  }

  const url: UrlObject = router.query.safe
    ? { pathname: AppRoutes.apps, query: { safe: router.query.safe, appUrl: safeApp.url } }
    : shareUrlObj

  const shareUrl = resolveHref(router, shareUrlObj)

  if (variant === 'compact') {
    return <CompactAppCard url={url} safeApp={safeApp} pinned={pinned} onPin={onPin} shareUrl={shareUrl} />
  }

  return (
    <AppCardContainer url={url}>
      <CardHeader
        avatar={<SafeAppIcon src={safeApp.iconUrl} alt={`${safeApp.name} logo`} />}
        action={
          <div className={styles.actionContainer}>
            {/* Share button */}
            <ShareButton shareUrl={shareUrl} safeApp={safeApp} />

            {/* Pin/unpin button */}
            {onPin && <PinButton pinned={Boolean(pinned)} safeApp={safeApp} onPin={onPin} />}

            {/* Delete custom app button */}
            {onDelete && <DeleteButton onDelete={onDelete} safeApp={safeApp} />}
          </div>
        }
      />

      <CardContent sx={{ paddingTop: 0 }}>
        <Typography gutterBottom variant="h5">
          {safeApp.name}
        </Typography>
        <Typography className={styles.truncateDescription} variant="body2" color="text.secondary">
          {safeApp.description}
        </Typography>
      </CardContent>
    </AppCardContainer>
  )
}

export { AppCard, AppCardContainer }
