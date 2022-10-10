import { Button, Typography, useMediaQuery } from '@mui/material'
import type { ReactElement } from 'react'
import { useTheme } from '@mui/material/styles'
import useOnboard, { connectWallet } from '@/hooks/wallets/useOnboard'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'
import KeyholeIcon from '@/components/common/icons/KeyholeIcon'
import { trackEvent } from '@/services/analytics'
import { WalletNames } from '@/utils/wallets'

const WalletDetails = ({ onConnect }: { onConnect?: () => void }): ReactElement => {
  const onboard = useOnboard()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // On mobile, automatically choose WalletConnect
  const options = isMobile
    ? {
        autoSelect: WalletNames.WALLET_CONNECT,
      }
    : undefined

  const handleConnect = async () => {
    if (!onboard) return

    // We `trackEvent` instead of using `<Track>` as it impedes styling
    trackEvent(OVERVIEW_EVENTS.OPEN_ONBOARD)

    onConnect?.()
    connectWallet(onboard, options)
  }

  return (
    <>
      <Typography variant="h5">Connect a wallet</Typography>

      <KeyholeIcon />

      <Button onClick={handleConnect} variant="contained" size="small" disableElevation fullWidth>
        Connect
      </Button>
    </>
  )
}

export default WalletDetails
