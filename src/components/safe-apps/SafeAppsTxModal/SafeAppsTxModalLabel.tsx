import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { Typography, Box } from '@mui/material'

import css from './styles.module.css'

const APP_LOGO_FALLBACK_IMAGE = '/images/apps-icon.svg'

const SafeAppsTxModalLabel = ({ app }: { app?: SafeAppData }) => {
  if (!app) {
    return <Typography variant="h3">Safe Apps Transaction</Typography>
  }

  return (
    <Box display="flex" alignItems="center">
      <img src={app?.iconUrl || APP_LOGO_FALLBACK_IMAGE} alt={app?.name} className={css.modalLabel} />
      <Typography variant="h4">{app?.name}</Typography>
    </Box>
  )
}

export default SafeAppsTxModalLabel
