import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'
import { Typography, FormControlLabel, Checkbox, Button, Box, Divider, Grid, LinearProgress } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import Track from '@/components/common/Track'
import { FormProvider, useForm } from 'react-hook-form'
import ErrorMessage from '@/components/tx/ErrorMessage'

import css from './styles.module.css'
import CodeInput from '../CodeInput'
import CooldownButton from '../CooldownButton'

type SmsFormData = {
  code: string
}

export const SmsRecovery = ({
  recoverFactorWithSms,
  sendSmsCode,
  onSuccess,
  onBack,
}: {
  recoverFactorWithSms: (code: string, storeDeviceFactor: boolean) => Promise<void>
  sendSmsCode: () => Promise<void>
  onSuccess?: (() => void) | undefined
  onBack: () => void
}) => {
  const [storeDeviceFactor, setStoreDeviceFactor] = useState(false)

  const formMethods = useForm<SmsFormData>({
    mode: 'all',
    defaultValues: {
      code: '',
    },
  })

  const { handleSubmit, formState, setValue, watch } = formMethods

  const [error, setError] = useState<string>()

  const onSubmit = async (data: SmsFormData) => {
    setError(undefined)
    try {
      await recoverFactorWithSms(data.code, storeDeviceFactor)
      onSuccess?.()
    } catch (e) {
      setError('Incorrect Code')
    }
  }

  // Initially we send a SMS code
  useEffect(() => {
    sendSmsCode()
  }, [sendSmsCode])

  const handleCodeChange = useCallback(
    (code: string) => {
      setValue('code', code)
    },
    [setValue],
  )

  const currentCode = watch('code')
  const isDisabled = formState.isSubmitting || currentCode.length < 6

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
                  Enter recovery code
                </Typography>
                <Typography>
                  This browser is not registered with your Account yet. Please enter the recovery code sent to your
                  phone to recover your social signer.
                </Typography>
              </Box>
              <Divider />
              <Box className={css.passwordWrapper}>
                <CodeInput length={6} onCodeChanged={handleCodeChange} />

                <CooldownButton cooldown={60} onClick={sendSmsCode} startDisabled={true}>
                  Resend Code
                </CooldownButton>

                <FormControlLabel
                  control={
                    <Checkbox checked={storeDeviceFactor} onClick={() => setStoreDeviceFactor((prev) => !prev)} />
                  }
                  label="Do not ask again on this device"
                />
                {error && <ErrorMessage className={css.loginError}>{error}</ErrorMessage>}
              </Box>

              <Divider />
              <Box p={4} display="flex" alignItems="center" justifyContent="space-between">
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
          </Grid>
        </Grid>
      </form>
    </FormProvider>
  )
}
