import type { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { Typography, Box } from '@mui/material'

import css from './styles.module.css'
import ImageFallback from '@/components/common/ImageFallback'

const APP_LOGO_FALLBACK_IMAGE = '/images/apps/apps-icon.svg'

const SafeAppsModalLabel = ({ app }: { app?: SafeAppData }) => {
  if (!app) {
    return <Typography variant="h3">Safe Apps Transaction</Typography>
  }

  return (
    <Box display="flex" alignItems="center">
      <ImageFallback
        src={app.iconUrl}
        fallbackSrc={APP_LOGO_FALLBACK_IMAGE}
        alt={app.name}
        className={css.modalLabel}
        width={24}
        height={24}
      />
      <Typography variant="h4">{app.name}</Typography>
    </Box>
  )
}

export default SafeAppsModalLabel
