import Track from '@/components/common/Track'
import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'
import { Box, Button, Typography } from '@mui/material'
import { useState } from 'react'
import ExportMPCAccountModal from '@/components/settings/SecurityLogin/SocialSignerExport/ExportMPCAccountModal'
import useWallet from '@/hooks/wallets/useWallet'
import { isSocialLoginWallet } from '@/services/mpc/SocialLoginModule'

const SocialSignerExport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const wallet = useWallet()
  const isSocialLogin = isSocialLoginWallet(wallet?.label)

  return (
    <>
      <Typography>
        Signers created via Google can be exported and imported to any non-custodial wallet outside of Safe.
      </Typography>

      <Box display="flex" mt={3} gap={2} alignItems="center">
        <Track {...MPC_WALLET_EVENTS.REVEAL_PRIVATE_KEY}>
          <Button
            color="primary"
            variant="contained"
            sx={{ pointerEvents: 'all !important' }}
            disabled={!isSocialLogin || isModalOpen}
            onClick={() => setIsModalOpen(true)}
          >
            Reveal private key
          </Button>
        </Track>

        {!isSocialLogin && <Typography>Please log in with your Google account first.</Typography>}
      </Box>

      <ExportMPCAccountModal onClose={() => setIsModalOpen(false)} open={isModalOpen} />
    </>
  )
}

export default SocialSignerExport
