import ErrorMessage from '@/components/tx/ErrorMessage'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Box, Button, CardActions, Divider, InputAdornment, TextField, Typography } from '@mui/material'
import commonCss from '@/components/tx-flow/common/styles.module.css'
import TxCard from '@/components/tx-flow/common/TxCard'
import type { UpsertRecoveryFlowProps } from '@/components/tx-flow/flows/UpsertRecovery/index'
import { EMAIL_REGEXP } from '@/features/recovery/components/RecoveryEmail/RegisterEmail'
import useRecoveryEmail from '@/features/recovery/components/RecoveryEmail/useRecoveryEmail'
import VerifyEmail, { NotVerifiedMessage } from '@/features/recovery/components/RecoveryEmail/VerifyEmail'
import { asError } from '@/services/exceptions/utils'
import { isWalletRejection } from '@/utils/wallets'
import CheckFilledIcon from '@/public/images/common/check-filled.svg'
import css from './styles.module.css'

const UpsertRecoveryFlowEmail = ({
  params,
  onSubmit,
}: {
  params: UpsertRecoveryFlowProps
  onSubmit: (formData: UpsertRecoveryFlowProps) => void
}) => {
  const [error, setError] = useState<string>()
  const [verifyEmailOpen, setVerifyEmailOpen] = useState<boolean>(false)
  const { getSignerEmailAddress, registerEmailAddress } = useRecoveryEmail()

  const formMethods = useForm<{ emailAddress: string; verified: boolean }>({
    mode: 'onChange',
    defaultValues: params,
  })

  const { watch, register, formState, handleSubmit, setValue } = formMethods

  const emailAddress = watch('emailAddress')
  const verified = watch('verified')

  const onFormSubmit = (data: { emailAddress: string }) => {
    // In case the user skips but already typed in an email
    if (verified === undefined) {
      return onSubmit({ ...params })
    }

    return onSubmit({ ...params, ...data })
  }

  const signToViewEmail = async () => {
    try {
      const response = await getSignerEmailAddress()

      if (response) {
        setValue('emailAddress', response.email)
        setValue('verified', response.verified)
      }
    } catch (e) {
      const error = asError(e)
      if (error.message !== 'Not Found') return

      registerEmail()
    }
  }

  const registerEmail = async () => {
    try {
      await registerEmailAddress(emailAddress)
      setValue('verified', false)
      toggleVerifyEmailDialog()
    } catch (e) {
      const error = asError(e)
      if (isWalletRejection(error)) return

      setError('Failed to register email address. Please try again.')
    }
  }

  const toggleVerifyEmailDialog = () => {
    setVerifyEmailOpen((prev) => !prev)
  }

  const onVerifySuccess = () => {
    toggleVerifyEmailDialog()
    setValue('verified', true)
  }

  const isInvalidEmail = !formState.isValid && formState.isDirty

  const continueButtonText = verified === false ? 'Verify' : verified === true ? 'Continue' : 'Sign & Verify'
  const continueButtonAction =
    verified === false ? toggleVerifyEmailDialog : verified === true ? handleSubmit(onFormSubmit) : signToViewEmail

  return (
    <>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onFormSubmit)} className={commonCss.form}>
          <TxCard>
            <Typography>
              We will contact you via your notification email address about any initiated recovery attempts and their
              status. You can always change it later.
            </Typography>

            <Box width={{ xs: 1, md: '60%' }}>
              <TextField
                {...register('emailAddress', { pattern: EMAIL_REGEXP })}
                error={isInvalidEmail}
                variant="outlined"
                label="Enter email address"
                helperText={
                  isInvalidEmail ? 'Enter a valid email address' : 'We will send a verification code to this email'
                }
                InputProps={{
                  endAdornment:
                    verified === true ? (
                      <InputAdornment position="end">
                        <Box className={css.checkIcon}>
                          <CheckFilledIcon />
                        </Box>
                      </InputAdornment>
                    ) : null,
                }}
                fullWidth
                sx={{ my: 1 }}
              />
            </Box>

            {verified === false && <NotVerifiedMessage onVerify={toggleVerifyEmailDialog} />}

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <Divider className={commonCss.nestedDivider} />

            <CardActions sx={{ mt: '0 !important', flexDirection: 'row !important', justifyContent: 'flex-end' }}>
              {verified === undefined && (
                <Button type="submit" disabled={false}>
                  Skip for now
                </Button>
              )}
              <Button variant="contained" onClick={continueButtonAction} disabled={isInvalidEmail || !emailAddress}>
                {continueButtonText}
              </Button>
            </CardActions>
          </TxCard>
        </form>
      </FormProvider>

      {verifyEmailOpen && <VerifyEmail onCancel={toggleVerifyEmailDialog} onSuccess={onVerifySuccess} />}
    </>
  )
}

export default UpsertRecoveryFlowEmail
