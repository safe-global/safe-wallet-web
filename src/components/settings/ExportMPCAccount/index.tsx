import { Alert, Box, Button, Typography } from '@mui/material'
import { useState } from 'react'
import ExportMPCAccountModal from './ExportMPCAccountModal'

const ExportMPCAccount = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Box display="flex" flexDirection="column" gap={2} alignItems="flex-start">
        <Typography>
          Accounts created via Google can be exported and imported to any non-custodial wallet outside of Safe.
        </Typography>
        <Alert severity="warning">
          Never disclose your keys or seed phrase to anyone. If someone gains access to them, they have full access over
          your signer account.
        </Alert>
        <Button color="primary" variant="contained" disabled={isModalOpen} onClick={() => setIsModalOpen(true)}>
          Reveal private key
        </Button>
      </Box>
      <ExportMPCAccountModal onClose={() => setIsModalOpen(false)} open={isModalOpen} />
    </>
  )
}

export default ExportMPCAccount
