import Link from 'next/link'
import { useRouter } from 'next/router'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { IconButton, SvgIcon } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'

import { getSafeAppUrl } from '@/components/new-safe-apps/SafeAppCard/SafeAppCard'
import ChainIndicator from '@/components/common/ChainIndicator'
import SafeAppIconCard from '../SafeAppIconCard/SafeAppIconCard'
import SafeAppActionButtons from '../SafeAppActionButtons/SafeAppActionButtons'
import CloseIcon from '@/public/images/common/close.svg'

import css from './styles.module.css'
import SafeAppTags from '../SafeAppTags/SafeAppTags'

type SafeAppPreviewDrawerProps = {
  safeApp?: SafeAppData
  isOpen: boolean
  isBookmarked?: boolean
  onClose: () => void
  onBookmark?: (safeAppId: number) => void
}

const SafeAppPreviewDrawer = ({ isOpen, safeApp, isBookmarked, onClose, onBookmark }: SafeAppPreviewDrawerProps) => {
  const router = useRouter()
  const safeAppUrl = getSafeAppUrl(router, safeApp?.url || '')

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <Box className={css.drawerContainer}>
        {/* Toolbar */}

        {safeApp && (
          <Box display="flex" justifyContent="right">
            <SafeAppActionButtons safeApp={safeApp} isBookmarked={isBookmarked} onBookmarkSafeApp={onBookmark} />
            <Tooltip title={`Close ${safeApp.name} preview`} placement="top">
              <IconButton
                aria-label="close"
                onClick={onClose}
                size="small"
                sx={{
                  color: 'border.main',
                  ml: 1,
                }}
              >
                <SvgIcon component={CloseIcon} inheritViewBox color="border" fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Safe App Info */}
        <Box sx={{ px: 1 }}>
          <SafeAppIconCard src={safeApp?.iconUrl || ''} alt={`${safeApp?.name} logo`} width={90} height={90} />
        </Box>

        <Typography variant="h4" fontWeight={700} sx={{ mt: 2 }}>
          {safeApp?.name}
        </Typography>

        <Typography variant="body2" color="primary.light" sx={{ mt: 2 }}>
          {safeApp?.description}
        </Typography>

        {/* Tags */}
        <SafeAppTags tags={safeApp?.tags || []} />

        {/* Networks */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Available networks
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          {safeApp?.chainIds.map((chainId) => (
            <ChainIndicator key={chainId} chainId={chainId} inline renderWhiteSpaceIfNoChain={false} />
          ))}
        </Box>

        {/* Open Safe App button */}
        <Link href={safeAppUrl} passHref>
          <Button fullWidth variant="contained" color="primary" component={'a'} href={safeApp?.url} sx={{ mt: 3 }}>
            Open App
          </Button>
        </Link>
      </Box>
    </Drawer>
  )
}

export default SafeAppPreviewDrawer
