import Link from 'next/link'
import { useRouter } from 'next/router'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'

import { getSafeAppUrl } from '@/components/new-safe-apps/SafeAppCard/SafeAppCard'
import css from './styles.module.css'

type SafeAppPreviewDrawerProps = {
  safeApp?: SafeAppData
  isOpen: boolean
  onClose: () => void
}

const SafeAppPreviewDrawer = ({ isOpen, safeApp, onClose }: SafeAppPreviewDrawerProps) => {
  const router = useRouter()
  const safeAppUrl = getSafeAppUrl(router, safeApp?.url || '')

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose}>
      {/* Safe App info */}
      <Box className={css.drawerContainer}>
        <Typography>{safeApp?.name}</Typography>

        <Typography>TODO: SAFE APP DATA</Typography>

        {/* Open Safe App button */}
        <Link href={safeAppUrl} passHref>
          <Button fullWidth variant="contained" color="primary" component={'a'} href={safeApp?.url}>
            Open App
          </Button>
        </Link>
      </Box>
    </Drawer>
  )
}

export default SafeAppPreviewDrawer
