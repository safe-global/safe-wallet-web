import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import SvgIcon from '@mui/material/SvgIcon'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import Link from 'next/link'
import { useRouter } from 'next/router'

import ChainIndicator from '@/components/common/ChainIndicator'
import SafeAppActionButtons from '@/components/safe-apps/SafeAppActionButtons'
import { getSafeAppUrl } from '@/components/safe-apps/SafeAppCard'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import SafeAppSocialLinksCard from '@/components/safe-apps/SafeAppSocialLinksCard'
import SafeAppTags from '@/components/safe-apps/SafeAppTags'
import { useOpenedSafeApps } from '@/hooks/safe-apps/useOpenedSafeApps'
import CloseIcon from '@/public/images/common/close.svg'
import css from './styles.module.css'

type SafeAppPreviewDrawerProps = {
  safeApp?: SafeAppData
  isOpen: boolean
  isBookmarked?: boolean
  onClose: () => void
  onBookmark?: (safeAppId: number) => void
}

const SafeAppPreviewDrawer = ({ isOpen, safeApp, isBookmarked, onClose, onBookmark }: SafeAppPreviewDrawerProps) => {
  const { markSafeAppOpened } = useOpenedSafeApps()
  const router = useRouter()
  const safeAppUrl = getSafeAppUrl(router, safeApp?.url || '')

  const onOpenSafe = () => {
    if (safeApp) {
      markSafeAppOpened(safeApp.id)
    }
  }

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      <Box data-sid="62884" className={css.drawerContainer}>
        {/* Toolbar */}

        {safeApp && (
          <Box data-sid="82352" display="flex" justifyContent="right">
            <SafeAppActionButtons safeApp={safeApp} isBookmarked={isBookmarked} onBookmarkSafeApp={onBookmark} />
            <Tooltip title={`Close ${safeApp.name} preview`} placement="top">
              <IconButton
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
        <Box data-sid="49930" sx={{ px: 1 }}>
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

        <Box data-sid="97355" sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          {safeApp?.chainIds.map((chainId) => (
            <ChainIndicator key={chainId} chainId={chainId} inline showUnknown={false} />
          ))}
        </Box>

        {/* Open Safe App button */}
        <Link href={safeAppUrl} passHref legacyBehavior>
          <Button
            data-sid="44043"
            fullWidth
            variant="contained"
            color="primary"
            component="a"
            href={safeApp?.url}
            sx={{ mt: 3 }}
            onClick={onOpenSafe}
          >
            Open Safe App
          </Button>
        </Link>

        {/* Safe App Social Links */}
        {safeApp && <SafeAppSocialLinksCard safeApp={safeApp} />}
      </Box>
    </Drawer>
  )
}

export default SafeAppPreviewDrawer
