import CheckWallet from '@/components/common/CheckWallet'
import RegisterEmail from '@/features/recovery/components/RecoveryEmail/RegisterEmail'
import useOnboard from '@/hooks/wallets/useOnboard'
import { asError } from '@/services/exceptions/utils'
import { getAssertedChainSigner } from '@/services/tx/tx-sender/sdk'
import { isWalletRejection } from '@/utils/wallets'
import type { GetEmailResponse } from '@safe-global/safe-gateway-typescript-sdk/dist/types/emails'
import { useState } from 'react'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Box, Button, Typography } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { getRegisteredEmail } from '@safe-global/safe-gateway-typescript-sdk'

const RecoveryEmail = () => {
  const [showRegisterForm, setShowRegisterForm] = useState<boolean>(false)
  const [email, setEmail] = useState<GetEmailResponse>()
  const onboard = useOnboard()
  const { safe, safeAddress } = useSafeInfo()

  const signToViewEmail = async () => {
    if (!onboard) return

    try {
      const signer = await getAssertedChainSigner(onboard, safe.chainId)
      const timestamp = Date.now().toString()
      const messageToSign = `email-retrieval-${safe.chainId}-${safeAddress}-${signer.address}-${timestamp}`
      const signedMessage = await signer.signMessage(messageToSign)

      const response = await getRegisteredEmail(safe.chainId, safeAddress, signer.address, {
        'Safe-Wallet-Signature': signedMessage,
        'Safe-Wallet-Signature-Timestamp': timestamp,
      })

      setEmail(response)
    } catch (e) {
      const error = asError(e)
      if (isWalletRejection(error)) return

      setShowRegisterForm(true)
    }
  }

  const onCancel = () => {
    setShowRegisterForm(false)
  }

  const onRegister = (emailAddress: string) => {
    setEmail({ email: emailAddress, verified: false })
    setShowRegisterForm(false)
  }

  return (
    <Box mt={4}>
      <Typography fontWeight="bold" mb={1}>
        Notification email
      </Typography>
      {email ? (
        <Typography>{email.email}</Typography>
      ) : showRegisterForm ? (
        <RegisterEmail onCancel={onCancel} onRegister={onRegister} />
      ) : (
        <CheckWallet>
          {(isOk) => (
            <Button
              onClick={signToViewEmail}
              variant="outlined"
              size="small"
              startIcon={<VisibilityOutlinedIcon />}
              disabled={!isOk}
            >
              Sign to view
            </Button>
          )}
        </CheckWallet>
      )}
      <Typography mt={1}>
        We will contact you via your notification email address about any initiated recovery attempts and their status.
      </Typography>
    </Box>
  )
}

export default RecoveryEmail
