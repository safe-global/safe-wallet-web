import { Box, Button, Typography } from '@mui/material'
import { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { AppRoutes } from '@/config/routes'

type Props = {
  wallet: ConnectedWallet | null
  onConnectWallet: () => Promise<void>
  safes: string[]
}

const UseApp = ({ wallet, onConnectWallet, safes }: Props): React.ReactElement => {
  const hasWallet = !!wallet
  const hasSafes = safes.length > 0
  const shouldCreateSafe = hasWallet && !hasSafes

  let button: React.ReactNode
  switch (true) {
    case hasWallet && hasSafes:
      button = (
        <Button variant="contained" sx={{ mt: 4, width: 186 }}>
          Use app
        </Button>
      )
      break
    case shouldCreateSafe:
      button = (
        <Button variant="contained" sx={{ mt: 4, width: 186 }} href={AppRoutes.open}>
          Create new Safe
        </Button>
      )
      break
    default:
      button = (
        <Button onClick={onConnectWallet} variant="contained" sx={{ mt: 4, width: 186 }}>
          Connect wallet
        </Button>
      )
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" fontWeight={700}>
      <Typography variant="h5" sx={{ mb: 3 }} fontWeight={700}>
        Use the App with your Safe
      </Typography>
      <img src="/images/safe-creation.svg" alt="An icon of a physical safe with a plus sign" />
      {button}
    </Box>
  )
}

export { UseApp }
