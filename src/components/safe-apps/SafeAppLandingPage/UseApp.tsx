import { Box, Button, Typography } from '@mui/material'
import { ConnectedWallet } from '@/hooks/wallets/useOnboard'

type Props = {
  wallet: ConnectedWallet | null
}

const UseApp = ({ wallet }: Props): React.ReactElement => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" fontWeight={700}>
      <Typography variant="h5" sx={{ mb: 3 }} fontWeight={700}>
        Use the App with your Safe
      </Typography>
      <img src="/images/safe-creation.svg" alt="An icon of a physical safe with a plus sign" />
      <Button variant="contained" sx={{ mt: 4, width: 186 }}>
        Use App
      </Button>
    </Box>
  )
}

export { UseApp }
