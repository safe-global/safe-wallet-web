import useSafeInfo from '@/hooks/useSafeInfo'
import useOnboard from '@/hooks/wallets/useOnboard'
import { asError } from '@/services/exceptions/utils'
import { getAssertedChainSigner } from '@/services/tx/tx-sender/sdk'
import { isWalletRejection } from '@/utils/wallets'
import { Button, Grid, TextField } from '@mui/material'
import Stack from '@mui/material/Stack'
import { registerEmail } from '@safe-global/safe-gateway-typescript-sdk'
import { useForm } from 'react-hook-form'

/**
 * This is the same pattern we use on the CGW
 * https://github.com/safe-global/safe-client-gateway/blob/main/src/domain/account/entities/account.entity.ts#L24
 */
const EMAIL_REGEXP =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const RegisterEmail = ({
  onCancel,
  onRegister,
}: {
  onCancel: () => void
  onRegister: (emailAddress: string) => void
}) => {
  const onboard = useOnboard()
  const { safe, safeAddress } = useSafeInfo()

  const { watch, register, formState } = useForm<{ emailAddress: string }>({
    mode: 'onChange',
  })

  const emailAddress = watch('emailAddress')

  const handleContinue = async () => {
    if (!onboard) return

    try {
      const signer = await getAssertedChainSigner(onboard, safe.chainId)
      const timestamp = Date.now().toString()
      const messageToSign = `email-register-${safe.chainId}-${safeAddress}-${emailAddress}-${signer.address}-${timestamp}`
      const signedMessage = await signer.signMessage(messageToSign)

      await registerEmail(
        safe.chainId,
        safeAddress,
        {
          emailAddress,
          signer: signer.address,
        },
        {
          'Safe-Wallet-Signature': signedMessage,
          'Safe-Wallet-Signature-Timestamp': timestamp,
        },
      )

      onRegister(emailAddress)
      // TODO: Open the verification dialog
    } catch (e) {
      const error = asError(e)
      if (isWalletRejection(error)) return
    }
  }

  const isInvalidEmail = !formState.isValid && formState.isDirty

  return (
    <Grid container gap={2} my={2}>
      <Grid item xs md={6}>
        <TextField
          {...register('emailAddress', { required: true, pattern: EMAIL_REGEXP })}
          error={isInvalidEmail}
          variant="outlined"
          label="Enter email address"
          helperText={isInvalidEmail ? 'Enter a valid email address' : 'We will send a verification code to this email'}
          fullWidth
        />
      </Grid>
      <Grid item xs={12}>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="contained" size="small" onClick={handleContinue} disabled={isInvalidEmail}>
            Continue
          </Button>
        </Stack>
      </Grid>
    </Grid>
  )
}

export default RegisterEmail
