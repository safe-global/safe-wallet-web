import { Button } from '@mui/material'
import useOnboard from '@/hooks/wallets/useOnboard'
import { logError, Errors } from '@/services/exceptions'

export const ConnectButton = () => {
  const onboard = useOnboard()

  const handleConnect = async () => {
    if (!onboard) return
    onboard.connectWallet().catch((e) => logError(Errors._302, (e as Error).message))
  }

  return (
    <Button onClick={handleConnect} variant="contained" size="small" disableElevation>
      Connect wallet
    </Button>
  )
}
