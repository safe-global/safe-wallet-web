import { Alert, SvgIcon } from '@mui/material'
import InfoOutlinedIcon from '@/public/images/notifications/info.svg'

export const TwapFallbackHandlerWarning = () => {
  return (
    <Alert
      severity="warning"
      icon={<SvgIcon component={InfoOutlinedIcon} inheritViewBox color="error" />}
      sx={{ mb: 1 }}
    >
      <b>Enable TWAPs and submit order.</b>
      {` `}
      To enable TWAP orders you need to set a custom fallback handler. This software is developed by CoW Swap and Safe
      will not be responsible for any possible issues with it.
    </Alert>
  )
}
