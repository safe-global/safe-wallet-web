import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'
import {
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  Divider,
  Grid,
  LinearProgress,
  FormControl,
} from '@mui/material'
import { useState } from 'react'
import Track from '@/components/common/Track'
import { FormProvider, useForm } from 'react-hook-form'
import PasswordInput from '@/components/settings/SecurityLogin/SocialSignerMFA/PasswordInput'
import ErrorMessage from '@/components/tx/ErrorMessage'

import css from './styles.module.css'

type PasswordFormData = {
  password: string
}

export const PasswordRecovery = ({
  recoverFactorWithPassword,
  onSuccess,
}: {
  recoverFactorWithPassword: (password: string, storeDeviceFactor: boolean) => Promise<void>
  onSuccess?: (() => void) | undefined
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
        <Grid container justifyContent="center" alignItems="center">
          <Grid item xs={12} md={5} p={2}>
            <Typography variant="h2" fontWeight="bold" mb={3}>
              Verify your account
            </Typography>
            <Box bgcolor="background.paper" borderRadius={1}>
              <LinearProgress
                color="secondary"
                sx={{ borderTopLeftRadius: '6px', borderTopRightRadius: '6px', opacity: isDisabled ? 1 : 0 }}
              />
              <Box p={4}>
                <Typography variant="h6" fontWeight="bold" mb={0.5}>
                  Enter security password
                </Typography>
                <Typography>
                  This browser is not registered with your Account yet. Please enter your recovery password to restore
                  access to this Account.
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
                  control={
                    <Checkbox checked={storeDeviceFactor} onClick={() => setStoreDeviceFactor((prev) => !prev)} />
                  }
                  label="Do not ask again on this device"
                />
                {error && <ErrorMessage className={css.loginError}>{error}</ErrorMessage>}
              </Box>

              <Divider />
              <Box p={4} display="flex" justifyContent="flex-end">
                <Track {...MPC_WALLET_EVENTS.RECOVER_PASSWORD}>
                  <Button variant="contained" type="submit" disabled={isDisabled}>
                    Submit
                  </Button>
                </Track>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  )
}
