import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'
import { Typography, FormControlLabel, Checkbox, Button, Box, Divider, Avatar } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import Track from '@/components/common/Track'
import { FormProvider, useForm } from 'react-hook-form'
import ErrorMessage from '@/components/tx/ErrorMessage'

import css from './styles.module.css'
import CodeInput from '../CodeInput'
import CooldownButton from '../CooldownButton'
import { obfuscateNumber } from '@/utils/phoneNumber'
import { asError } from '@/services/exceptions/utils'

type SmsFormData = {
  code: string
}

export const SmsRecovery = ({
  recoverFactorWithSms,
  sendSmsCode,
  onSuccess,
  onBack,
  phoneNumber,
}: {
  recoverFactorWithSms: (code: string, storeDeviceFactor: boolean) => Promise<void>
  sendSmsCode: () => Promise<void>
  onSuccess?: (() => void) | undefined
  onBack: () => void
  phoneNumber: string | undefined
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
      setError(asError(e).message)
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
        <Box>
          <Box p={4}>
            <Box display="flex" flexDirection="row" gap={1} alignItems="center" mb={0.5}>
              <Avatar className={css.dot}>
                <Typography variant="body2">{2}</Typography>
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                Enter recovery code
              </Typography>
            </Box>
            <Typography variant="body2" pl={'28px'}>
              Please enter the recovery code sent to your phone.
            </Typography>
          </Box>
          <Divider />
          <Box className={css.passwordWrapper}>
            <Typography className={css.phoneNumberDisplay}>{obfuscateNumber(phoneNumber)}</Typography>

            <CodeInput length={6} onCodeChanged={handleCodeChange} />

            <CooldownButton cooldown={60} onClick={sendSmsCode} startDisabled={true}>
              Resend code
            </CooldownButton>

            <FormControlLabel
              control={<Checkbox checked={storeDeviceFactor} onClick={() => setStoreDeviceFactor((prev) => !prev)} />}
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
      </form>
    </FormProvider>
  )
}
