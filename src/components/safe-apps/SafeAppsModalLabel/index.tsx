import type { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { Typography, Box } from '@mui/material'
import SafeAppIcon from '../SafeAppIcon'

const APP_LOGO_FALLBACK_IMAGE = '/images/apps/apps-icon.svg'

const SafeAppsModalLabel = ({ app }: { app?: SafeAppData }) => {
  if (!app) {
    return <Typography variant="h3">Safe Apps Transaction</Typography>
  }

  return (
    <Box display="flex" alignItems="center">
      <Box pr={1.2} display="flex" alignItems="center">
        <SafeAppIcon src={app.iconUrl || APP_LOGO_FALLBACK_IMAGE} alt={app.name} width={24} height={24} />
      </Box>
      <Typography variant="h4">{app.name}</Typography>
    </Box>
  )
}

export default SafeAppsModalLabel
