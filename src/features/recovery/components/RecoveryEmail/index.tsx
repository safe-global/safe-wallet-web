import CheckWallet from '@/components/common/CheckWallet'
import RegisterEmail from '@/features/recovery/components/RecoveryEmail/RegisterEmail'
import useRecoveryEmail from '@/features/recovery/components/RecoveryEmail/useRecoveryEmail'
import VerifyEmail, {
  isNoContentResponse,
  NotVerifiedMessage,
} from '@/features/recovery/components/RecoveryEmail/VerifyEmail'
import DeleteIcon from '@/public/images/common/delete.svg'
import { asError } from '@/services/exceptions/utils'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import { isWalletRejection } from '@/utils/wallets'
import Stack from '@mui/material/Stack'
import type { GetEmailResponse } from '@safe-global/safe-gateway-typescript-sdk/dist/types/emails'
import { useState } from 'react'
import { Box, Button, IconButton, SvgIcon, Tooltip, Typography } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded'

const RecoveryEmail = () => {
  const [showRegisterForm, setShowRegisterForm] = useState<boolean>(false)
  const [verifyEmailOpen, setVerifyEmailOpen] = useState<boolean>(false)
  const [email, setEmail] = useState<GetEmailResponse>()
  const dispatch = useAppDispatch()

  const { getSignerEmailAddress, deleteEmailAddress } = useRecoveryEmail()

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

  const onVerifySuccess = () => {
    toggleVerifyEmailDialog()
    setEmail(
      (prev) =>
        prev && {
          email: prev.email,
          verified: true,
        },
    )
  }

  const onDelete = async () => {
    try {
      await deleteEmailAddress()
    } catch (e) {
      const error = asError(e)

      if (isNoContentResponse(error.message)) {
        setEmail(undefined)

        dispatch(
          showNotification({
            variant: 'success',
            groupKey: 'delete-email-complete',
            message: 'Your email was deleted',
          }),
        )
      }
    }
  }

  return (
    <Box mt={4}>
      <Typography fontWeight="bold" mb={2}>
        Notification email
      </Typography>

      {email ? (
        <>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <SvgIcon component={MailOutlineRoundedIcon} inheritViewBox fontSize="small" />
            <Typography>{email.email}</Typography>
            <CheckWallet>
              {(isOk) => (
                <Tooltip title={isOk ? 'Delete email' : undefined}>
                  <span>
                    <IconButton onClick={onDelete} size="small" disabled={!isOk} sx={{ ml: 1 }}>
                      <SvgIcon component={DeleteIcon} inheritViewBox color="error" fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </CheckWallet>
          </Stack>
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

      <Typography mt={2}>
        We will contact you via your notification email address about any initiated recovery attempts and their status.
      </Typography>

      {verifyEmailOpen && <VerifyEmail onCancel={toggleVerifyEmailDialog} onSuccess={onVerifySuccess} />}
    </Box>
  )
}

export default RecoveryEmail
