import CheckWallet from '@/components/common/CheckWallet'
import RegisterEmail from '@/features/recovery/components/RecoveryEmail/RegisterEmail'
import useRecoveryEmail from '@/features/recovery/components/RecoveryEmail/useRecoveryEmail'
import VerifyEmail, { NotVerifiedMessage } from '@/features/recovery/components/RecoveryEmail/VerifyEmail'
import { asError } from '@/services/exceptions/utils'
import { isWalletRejection } from '@/utils/wallets'
import type { GetEmailResponse } from '@safe-global/safe-gateway-typescript-sdk/dist/types/emails'
import { useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

const RecoveryEmail = () => {
  const [showRegisterForm, setShowRegisterForm] = useState<boolean>(false)
  const [verifyEmailOpen, setVerifyEmailOpen] = useState<boolean>(false)
  const [email, setEmail] = useState<GetEmailResponse>()

  const { getSignerEmailAddress } = useRecoveryEmail()

  const signToViewEmail = async () => {
    try {
      const response = await getSignerEmailAddress()

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
    setVerifyEmailOpen(true)
  }

  const toggleVerifyEmailDialog = () => {
    setVerifyEmailOpen((prev) => !prev)
  }

  return (
    <Box mt={4}>
      <Typography fontWeight="bold" mb={1}>
        Notification email
      </Typography>

      {email ? (
        <>
          <Typography>{email.email}</Typography>
          {!email.verified && <NotVerifiedMessage onVerify={toggleVerifyEmailDialog} />}
        </>
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

      {verifyEmailOpen && <VerifyEmail onCancel={toggleVerifyEmailDialog} />}
    </Box>
  )
}

export default RecoveryEmail
