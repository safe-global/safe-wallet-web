import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import { Typography, Box } from '@mui/material'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'

const APP_LOGO_FALLBACK_IMAGE = '/images/apps/apps-icon.svg'

const SafeAppsModalLabel = ({ app }: { app?: SafeAppData }) => {
  if (!app) {
    return <Typography variant="h3">Safe Apps Transaction</Typography>
  }

  return (
    <Box display="flex" alignItems="center">
      <Box pr={1.2} display="flex" alignItems="center">
        <SafeAppIconCard src={app.iconUrl || APP_LOGO_FALLBACK_IMAGE} alt={app.name} width={24} height={24} />
      </Box>
      <Typography variant="h4">{app.name}</Typography>
    </Box>
  )
}

export default SafeAppsModalLabel
