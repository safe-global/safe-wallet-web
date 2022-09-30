import { ReactElement, ReactNode, SyntheticEvent } from 'react'
import { useRouter } from 'next/router'
import Link, { LinkProps } from 'next/link'
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import ShareIcon from '@/public/images/common/share.svg'
import CopyButton from '@/components/common/CopyButton'
import BookmarkIcon from '@/public/images/apps/bookmark.svg'
import DeleteIcon from '@/public/images/common/delete.svg'
import { AppRoutes } from '@/config/routes'
import styles from './styles.module.css'
import { useCurrentChain } from '@/hooks/useChains'
import { SvgIcon } from '@mui/material'
import { UrlObject } from 'url'
import { resolveHref } from 'next/dist/shared/lib/router/router'

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
  default = '180px',
}

const enum AppCardVariantAspectRatio {
  compact = '1 / 1',
  default = 'auto',
}

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
      <Link href={url}>
        <a rel="noreferrer">{card}</a>
      </Link>
    )
  }

  return card
}

const CompactAppCard = ({ url, safeApp, onPin, pinned, shareUrl }: CompactSafeAppCardProps): ReactElement => (
  <AppCardContainer url={url} variant="compact">
    <div className={styles.compactCardContainer}>
      {/* App logo */}
      <Avatar
        src={safeApp.iconUrl}
        alt={`${safeApp.name} logo`}
        variant="square"
        sx={{ objectFit: 'contain', width: 52, height: 52 }}
      />

      {/* Share button */}
      <CopyButton
        text={shareUrl}
        initialToolTipText={`Copy share URL for ${safeApp.name}`}
        className={styles.compactShareButton}
      >
        <SvgIcon component={ShareIcon} inheritViewBox color="border" fontSize="small" />
      </CopyButton>

      {/* Pin/unpin button */}
      {onPin && (
        <IconButton
          aria-label={`${pinned ? 'Unpin' : 'Pin'} ${safeApp.name}`}
          size="small"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onPin(safeApp.id)
          }}
          title={`${pinned ? 'Unpin' : 'Pin'} ${safeApp.name}`}
          sx={{ position: 'absolute', top: 2, right: 2 }}
        >
          <SvgIcon component={BookmarkIcon} inheritViewBox color={pinned ? 'primary' : 'border'} fontSize="small" />
        </IconButton>
      )}
    </div>
  </AppCardContainer>
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
        avatar={
          <Avatar src={safeApp.iconUrl} alt={`${safeApp.name} logo`} variant="square" sx={{ objectFit: 'contain' }} />
        }
        action={
          <>
            {/* Share button */}
            <CopyButton text={shareUrl} initialToolTipText={`Copy share URL for ${safeApp.name}`}>
              <SvgIcon component={ShareIcon} inheritViewBox color="border" fontSize="small" />
            </CopyButton>

            {/* Pin/unpin button */}
            {onPin && (
              <IconButton
                aria-label={`${pinned ? 'Unpin' : 'Pin'} ${safeApp.name}`}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onPin(safeApp.id)
                }}
                title={`${pinned ? 'Unpin' : 'Pin'} ${safeApp.name}`}
                size="small"
              >
                <SvgIcon
                  component={BookmarkIcon}
                  inheritViewBox
                  color={pinned ? 'primary' : 'border'}
                  fontSize="small"
                />
              </IconButton>
            )}

            {/* Delete custom app button */}
            {onDelete && (
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
            )}
          </>
        }
      />

      <CardContent sx={{ paddingTop: 0 }}>
        <Typography gutterBottom variant="h5">
          {safeApp.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {safeApp.description}
        </Typography>
      </CardContent>
    </AppCardContainer>
  )
}

export { AppCard, AppCardContainer }
