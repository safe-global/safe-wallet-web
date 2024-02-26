import { Button, DialogActions, DialogContent, Typography, Stack } from '@mui/material'
import { resendEmailVerificationCode, verifyEmail } from '@safe-global/safe-gateway-typescript-sdk'
import useSafeInfo from '@/hooks/useSafeInfo'
import useOnboard from '@/hooks/wallets/useOnboard'
import { getAssertedChainSigner } from '@/services/tx/tx-sender/sdk'
import CodeInput from '@/components/common/CodeInput'
import { useState } from 'react'
import CooldownLink from 'src/components/common/CooldownLink'
import ModalDialog from '@/components/common/ModalDialog'

const CODE_LENGTH = 6

const VerifyEmail = ({ onCancel }: { onCancel: () => void }) => {
  const [verificationCode, setVerificationCode] = useState<string>('')
  const onboard = useOnboard()
  const { safe, safeAddress } = useSafeInfo()

  const handleRetry = async () => {
    if (!onboard) return

    try {
      const signer = await getAssertedChainSigner(onboard, safe.chainId)

      await resendEmailVerificationCode(safe.chainId, safeAddress, signer.address)
    } catch (e) {
      console.log(e)
      // TODO: logError
    }
  }

  const handleVerify = async () => {
    if (!onboard) return

    try {
      const signer = await getAssertedChainSigner(onboard, safe.chainId)

      await verifyEmail(safe.chainId, safeAddress, signer.address, { code: verificationCode })
    } catch (e) {
      console.log(e)
      // TODO: logError
    }
  }

  const isDisabled = verificationCode.length < CODE_LENGTH

  return (
    <ModalDialog open dialogTitle="Verify your email address" onClose={onCancel} hideChainIndicator>
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
