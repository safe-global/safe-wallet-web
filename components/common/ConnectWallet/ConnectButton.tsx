import { Box, Button } from '@mui/material'
import css from '@/components/common/ConnectWallet/styles.module.css'
import useOnboard from '@/hooks/wallets/useOnboard'

export const ConnectButton = () => {
  const onboard = useOnboard()

  const handleConnect = () => {
    onboard?.connectWallet()
  }

  return (
    <Box className={css.buttonContainer}>
      <Button onClick={handleConnect} variant="contained" size="small" fullWidth disableElevation>
        Connect wallet
      </Button>
    </Box>
  )
}
