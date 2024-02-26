import { useState } from 'react'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useRecoveryEmail from '@/features/recovery/components/RecoveryEmail/useRecoveryEmail'
import { Button, DialogActions, DialogContent, Typography, Stack, Link } from '@mui/material'
import CodeInput from '@/components/common/CodeInput'
import CooldownLink from 'src/components/common/CooldownLink'
import ModalDialog from '@/components/common/ModalDialog'

const CODE_LENGTH = 6

export const NotVerifiedMessage = ({ onVerify }: { onVerify: () => void }) => {
  return (
    <ErrorMessage level="border">
      <Typography fontWeight="bold">Email not verified</Typography>
      You didn&apos;t finish the verification yet. Once confirmed, it will be added as your notification email.{' '}
      <Link href="#" onClick={onVerify}>
        Verify email
      </Link>
    </ErrorMessage>
  )
}

const VerifyEmail = ({ onCancel, open }: { onCancel: () => void; open: boolean }) => {
  const [verificationCode, setVerificationCode] = useState<string>('')
  const { verifyEmailAddress, resendVerification } = useRecoveryEmail()

  const handleRetry = async () => {
    try {
      await resendVerification()
    } catch (e) {
      console.log(e)
      // TODO: logError
    }
  }

  const handleVerify = async () => {
    try {
      await verifyEmailAddress(verificationCode)
    } catch (e) {
      console.log(e)
      // TODO: logError
    }
  }

  const isDisabled = verificationCode.length < CODE_LENGTH

  return (
    <ModalDialog open={open} dialogTitle="Verify your email address" onClose={onCancel} hideChainIndicator>
      <DialogContent>
        <Stack mt={2} direction="column" gap={2}>
          <Typography>Enter the 6-digit code that we sent to the email address you provided.</Typography>
          <CodeInput length={CODE_LENGTH} onCodeChanged={setVerificationCode} />
          <Typography>
            Didn&apos;t get the code?{' '}
            <CooldownLink onClick={handleRetry} cooldown={60}>
              Resend
            </CooldownLink>
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleVerify} disabled={isDisabled}>
          Verify
        </Button>
      </DialogActions>
    </ModalDialog>
  )
}

export default VerifyEmail
