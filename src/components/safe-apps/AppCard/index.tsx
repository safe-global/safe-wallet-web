import { ReactElement, ReactNode, SyntheticEvent } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import ShareIcon from '@/public/images/share.svg'
import CopyButton from '@/components/common/CopyButton'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import DeleteIcon from '@/public/images/delete.svg'
import { AppRoutes } from '@/config/routes'
import styles from './styles.module.css'
import { useCurrentChain } from '@/hooks/useChains'

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
  url: string
  pinned?: boolean
  onPin?: (appId: number) => void
  onShareClick?: (event: SyntheticEvent) => void
  shareUrl: string
}

type AppCardContainerProps = {
  url?: string
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

  if (url) {
    return (
      <Link href={url}>
        <a rel="noreferrer">
          <Card
            sx={({ palette }) => ({
              height,
              aspectRatio,
              transition: 'background-color 0.3s ease-in-out, border 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: palette.primary.background,
                border: `2px solid ${palette.primary.light}`,
              },
            })}
          >
            {children}
          </Card>
        </a>
      </Link>
    )
  }

  return (
    <Card
      sx={({ palette }) => ({
        height,
        transition: 'background-color 0.3s ease-in-out, border 0.3s ease-in-out',
        '&:hover': {
          backgroundColor: palette.primary.background,
          border: `2px solid ${palette.primary.light}`,
        },
      })}
    >
      {children}
    </Card>
  )
}

const CompactAppCard = ({ url, safeApp, onPin, pinned, shareUrl }: CompactSafeAppCardProps): ReactElement => (
  <AppCardContainer url={url} variant="compact">
    <div className={styles.compactCardContainer}>
      <img src={safeApp.iconUrl} style={{ width: 52, height: 52 }} alt={`${safeApp.name} logo`} />
      <CopyButton
        text={shareUrl}
        ariaLabel={`Share ${safeApp.name}`}
        initialToolTipText={`Copy share URL for ${safeApp.name}`}
        className={styles.compactShareButton}
      >
        <ShareIcon width={16} alt="Share icon" />
      </CopyButton>
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
          sx={{ width: '32px', position: 'absolute', top: 2, right: 2 }}
        >
          {pinned ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        </IconButton>
      )}
    </div>
  </AppCardContainer>
)

const AppCard = ({ safeApp, pinned, onPin, onDelete, variant = 'default' }: AppCardProps): ReactElement => {
  const router = useRouter()
  const currentChain = useCurrentChain()

  const shareUrl = `${window.location.origin}${AppRoutes.share.safeApp}?appUrl=${safeApp.url}&chain=${currentChain?.shortName}`
  const url = router.query.safe ? `${AppRoutes.safe.apps}?safe=${router.query.safe}&appUrl=${safeApp.url}` : shareUrl

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
            <CopyButton
              text={shareUrl}
              ariaLabel={`Share ${safeApp.name}`}
              initialToolTipText={`Copy share URL for ${safeApp.name}`}
              className={styles.shareButton}
            >
              <ShareIcon width={16} alt="Share icon" />
            </CopyButton>
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
                sx={{ width: '32px' }}
              >
                {pinned ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
            )}
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
                <DeleteIcon width={16} alt="Delete icon" />
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
