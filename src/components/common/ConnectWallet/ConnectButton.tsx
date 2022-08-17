import { Box, Button } from '@mui/material'
import css from '@/components/common/ConnectWallet/styles.module.css'
import useOnboard from '@/hooks/wallets/useOnboard'
import { logError, Errors } from '@/services/exceptions'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'
import Track from '../Track'

export const ConnectButton = () => {
  const onboard = useOnboard()

  const handleConnect = async () => {
    if (!onboard) return
    onboard.connectWallet().catch((e) => logError(Errors._302, (e as Error).message))
  }

  return (
    <Box className={css.buttonContainer}>
      <Track {...OVERVIEW_EVENTS.OPEN_ONBOARD}>
        <Button onClick={handleConnect} variant="contained" size="small" disableElevation>
          Connect wallet
        </Button>
      </Track>
    </Box>
  )
}
