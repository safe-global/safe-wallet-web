import { useState } from 'react'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useRecoveryEmail from '@/features/recovery/components/RecoveryEmail/useRecoveryEmail'
import { asError } from '@/services/exceptions/utils'
import { isWalletRejection } from '@/utils/wallets'
import { Button, Grid, TextField } from '@mui/material'
import Stack from '@mui/material/Stack'
import { useForm } from 'react-hook-form'

/**
 * This is the same pattern we use on the CGW
 * https://github.com/safe-global/safe-client-gateway/blob/main/src/domain/account/entities/account.entity.ts#L24
 */
export const EMAIL_REGEXP =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const RegisterEmail = ({
  onCancel,
  onRegister,
  initialValue,
}: {
  onCancel: () => void
  onRegister: (emailAddress: string) => void
  initialValue?: string
}) => {
  const [error, setError] = useState<string>()
  const { registerEmailAddress, editEmailAddress } = useRecoveryEmail()

  const { watch, register, formState } = useForm<{ emailAddress: string }>({
    mode: 'onChange',
    defaultValues: {
      emailAddress: initialValue,
    },
  })

  const emailAddress = watch('emailAddress')

  const handleContinue = async () => {
    try {
      initialValue ? await editEmailAddress(emailAddress) : await registerEmailAddress(emailAddress)

      onRegister(emailAddress)
    } catch (e) {
      const error = asError(e)
      if (isWalletRejection(error)) return

      setError(`Failed to ${initialValue ? 'edit' : 'register'} email address. Please try again.`)
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
            Verify
          </Button>
        </Stack>
      </Grid>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Grid>
  )
}

export default RegisterEmail
