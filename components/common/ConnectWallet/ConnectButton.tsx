import { Box, Button } from '@mui/material'
import css from '@/components/common/ConnectWallet/styles.module.css'
import useOnboard from '@/hooks/wallets/useOnboard'

export const ConnectButton = () => {
  const onboard = useOnboard()

  const handleConnect = async () => {
    if (!onboard) return
    onboard.connectWallet().catch(console.error)
  }

  return (
    <Box className={css.buttonContainer}>
      <Button onClick={handleConnect} variant="contained" size="small" disableElevation>
        Connect wallet
      </Button>
    </Box>
  )
}
