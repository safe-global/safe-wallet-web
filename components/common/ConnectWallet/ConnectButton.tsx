import { Box, Button } from '@mui/material'
import css from '@/components/common/ConnectWallet/styles.module.css'
import useOnboard from '@/hooks/wallets/useOnboard'
import { logError, Errors } from '@/services/exceptions'

export const ConnectButton = () => {
  const onboard = useOnboard()

  const handleConnect = async () => {
    if (!onboard) return

    try {
      await onboard.connectWallet()
    } catch (e) {
      logError(Errors._302, (e as Error).message)
    }
  }

  return (
    <Box className={css.buttonContainer}>
      <Button onClick={handleConnect} variant="contained" size="small" disableElevation>
        Connect wallet
      </Button>
    </Box>
  )
}
