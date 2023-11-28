import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'
import { Typography, FormControlLabel, Checkbox, Button, Box, Divider, FormControl, Avatar } from '@mui/material'
import { useState } from 'react'
import Track from '@/components/common/Track'
import { FormProvider, useForm } from 'react-hook-form'
import PasswordInput from '@/components/settings/SecurityLogin/PasswordMfaForm/PasswordInput'
import ErrorMessage from '@/components/tx/ErrorMessage'

import css from './styles.module.css'

type PasswordFormData = {
  password: string
}

export const PasswordRecovery = ({
  recoverFactorWithPassword,
  onSuccess,
  onBack,
}: {
  recoverFactorWithPassword: (password: string, storeDeviceFactor: boolean) => Promise<void>
  onSuccess?: (() => void) | undefined
  onBack: () => void
}) => {
  const [storeDeviceFactor, setStoreDeviceFactor] = useState(false)

  const formMethods = useForm<PasswordFormData>({
    mode: 'all',
    defaultValues: {
      password: '',
    },
  })

  const { handleSubmit, formState } = formMethods

  const [error, setError] = useState<string>()

  const onSubmit = async (data: PasswordFormData) => {
    setError(undefined)
    try {
      await recoverFactorWithPassword(data.password, storeDeviceFactor)

      onSuccess?.()
    } catch (e) {
      setError('Incorrect password')
    }
  }

  const isDisabled = formState.isSubmitting

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box>
          <Box p={4}>
            <Box display="flex" flexDirection="row" gap={1} alignItems="center" mb={0.5}>
              <Avatar className={css.dot}>
                <Typography variant="body2">{2}</Typography>
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                Enter recovery password
              </Typography>
            </Box>
            <Typography variant="body2" pl={'28px'}>
              Please enter your recovery password.
            </Typography>
          </Box>
          <Divider />
          <Box className={css.passwordWrapper}>
            <FormControl fullWidth>
              <PasswordInput
                name="password"
                label="Recovery password"
                helperText={formState.errors['password']?.message}
                disabled={isDisabled}
                required
              />
            </FormControl>
            <FormControlLabel
              disabled={isDisabled}
              control={<Checkbox checked={storeDeviceFactor} onClick={() => setStoreDeviceFactor((prev) => !prev)} />}
              label="Do not ask again on this device"
            />
            {error && <ErrorMessage className={css.loginError}>{error}</ErrorMessage>}
          </Box>

          <Divider />
          <Box p={4} display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={onBack}>
              Back
            </Button>
            <Track {...MPC_WALLET_EVENTS.RECOVER_PASSWORD}>
              <Button variant="contained" type="submit" disabled={isDisabled}>
                Submit
              </Button>
            </Track>
          </Box>
        </Box>
      </form>
    </FormProvider>
  )
}
