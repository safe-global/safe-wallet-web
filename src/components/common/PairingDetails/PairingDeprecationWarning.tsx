import { Alert } from '@mui/material'

const PairingDeprecationWarning = (): React.ReactElement => {
  return (
    <Alert severity="warning" sx={{ mb: 4 }}>
      We&apos;re sorry to share that the Safe mobile pairing feature will be <b>discontinued</b> in November 2023.
      Please plan a migration to a different wallet as soon as possible.
    </Alert>
  )
}

export default PairingDeprecationWarning
