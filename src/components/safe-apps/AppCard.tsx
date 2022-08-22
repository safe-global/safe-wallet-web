import { ReactElement, ReactNode, SyntheticEvent } from 'react'
import { useRouter } from 'next/router'
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { SAFE_REACT_URL } from '@/config/constants'
import useChainId from '@/hooks/useChainId'
import ShareIcon from '@/public/images/share.svg'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
//import DeleteIcon from '@/public/images/delete.svg'

export type SafeAppCardVariants = 'default' | 'compact'

type AppCardProps = {
  safeApp: SafeAppData
  onPin?: (appId: number) => void
  variant?: SafeAppCardVariants
}

type CompactSafeAppCardProps = {
  safeApp: SafeAppData
  url: string
  onPin?: (appId: number) => void
}

type AppCardContainerProps = {
  url?: string
  children: ReactNode
}

const AppCardContainer = ({ url, children }: AppCardContainerProps): ReactElement => {
  if (url) {
    return (
      <a href={url} target="_blank" rel="noreferrer">
        <Card
          sx={({ palette }) => ({
            height: 190,
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
    )
  }

  return (
    <Card
      sx={({ palette }) => ({
        height: 190,
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

const CompactAppCard = ({ url, safeApp }: CompactSafeAppCardProps): ReactElement => (
  <AppCardContainer url={url}>
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img src={safeApp.iconUrl} style={{ width: 64, height: 64 }} alt={`${safeApp.name} logo`} />
    </Box>
  </AppCardContainer>
)

const AppCard = ({ safeApp, onPin, variant = 'default' }: AppCardProps): ReactElement => {
  const router = useRouter()
  const chainId = useChainId()

  const shareUrl = `${SAFE_REACT_URL}/share/safe-app?appUrl=${safeApp.url}&chainId=${chainId}`
  const url = router.query.safe ? `${SAFE_REACT_URL}/${router.query.safe}/apps?appUrl=${safeApp.url}` : shareUrl

  const onShareClick = (e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(shareUrl)
  }

  if (variant === 'compact') {
    return <CompactAppCard url={url} safeApp={safeApp} />
  }

  return (
    <AppCardContainer url={url}>
      <CardHeader
        avatar={
          <Avatar src={safeApp.iconUrl} alt={`${safeApp.name} logo`} variant="square" sx={{ objectFit: 'contain' }} />
        }
        action={
          <>
            <IconButton
              aria-label={`Share ${safeApp.name}`}
              size="small"
              onClick={onShareClick}
              title="Click to copy share URL"
              sx={{ width: '32px' }}
            >
              <ShareIcon width={16} alt="Share icon" />
            </IconButton>
            {onPin && (
              <IconButton
                aria-label={`Pin ${safeApp.name}`}
                size="small"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onPin(safeApp.id)
                }}
                title="Click to pin app"
                sx={{ width: '32px' }}
              >
                <BookmarkBorderIcon />
              </IconButton>
            )}
            {/* <IconButton aria-label={`Delete ${safeApp.name}`} size="small">
              <DeleteIcon width={16} alt="Delete icon" />
            </IconButton> */}
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
