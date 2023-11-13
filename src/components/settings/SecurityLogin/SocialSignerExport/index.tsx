import Track from '@/components/common/Track'
import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'
import { Alert, Box, Button, Tooltip, Typography } from '@mui/material'
import { useState } from 'react'
import ExportMPCAccountModal from '@/components/settings/SecurityLogin/SocialSignerExport/ExportMPCAccountModal'
import useSocialWallet from '@/hooks/wallets/mpc/useSocialWallet'

const SocialSignerExport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const socialWalletService = useSocialWallet()

  const isPasswordSet = socialWalletService?.isRecoveryPasswordSet() ?? false

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

        <Track {...MPC_WALLET_EVENTS.REVEAL_PRIVATE_KEY}>
          <Tooltip title={isPasswordSet ? '' : 'Private key export is only available if you set a recovery password'}>
            <span>
              <Button
                color="primary"
                variant="contained"
                sx={{ pointerEvents: 'all !important' }}
                disabled={isModalOpen || !isPasswordSet}
                onClick={() => setIsModalOpen(true)}
              >
                Reveal private key
              </Button>
            </span>
          </Tooltip>
        </Track>
      </Box>
      <ExportMPCAccountModal onClose={() => setIsModalOpen(false)} open={isModalOpen} />
    </>
  )
}

export default SocialSignerExport
