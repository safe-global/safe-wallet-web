import { Alert, Box, Button, Typography } from '@mui/material'
import { useState } from 'react'
import ExportMPCAccountModal from '@/components/settings/SecurityLogin/SocialSignerExport/ExportMPCAccountModal'

const SocialSignerExport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Box display="flex" flexDirection="column" gap={2} alignItems="flex-start">
        <Typography>
          Signers created via Google can be exported and imported to any non-custodial wallet outside of Safe.
        </Typography>
        <Alert severity="warning">
          Never disclose your keys or seed phrase to anyone. If someone gains access to them, they have full access over
          your social login signer.
        </Alert>
        <Button color="primary" variant="contained" disabled={isModalOpen} onClick={() => setIsModalOpen(true)}>
          Reveal private key
        </Button>
      </Box>
      <ExportMPCAccountModal onClose={() => setIsModalOpen(false)} open={isModalOpen} />
    </>
  )
}

export default SocialSignerExport
