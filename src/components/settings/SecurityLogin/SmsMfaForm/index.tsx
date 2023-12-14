import Track from '@/components/common/Track'
import {
  Typography,
  Button,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  FormControl,
  Alert,
  TextField,
  AlertTitle,
} from '@mui/material'
import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import LockWarningIcon from '@/public/images/common/lock-warning.svg'
import css from './styles.module.css'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import useSocialWallet, { useMfaStore } from '@/hooks/wallets/mpc/useSocialWallet'
import { obfuscateNumber } from '@/utils/phoneNumber'
import { asError } from '@/services/exceptions/utils'
import CodeInput from '@/components/common/CodeInput'
import CooldownLink from '@/components/common/CooldownLink'
import MfaFactorSummary from '../MfaFactorSummary'

enum SmsOtpFieldNames {
  mobileNumber = 'mobileNumber',
  verificationCode = 'verificationCode',
}

type SmsOtpFormData = {
  [SmsOtpFieldNames.mobileNumber]: string
  [SmsOtpFieldNames.verificationCode]: string | undefined
}

// For now we just have a very simple regex that ensures the number thats with "+" and numbers or whitespace
// The numbers will also get validated by the backend
const phoneRegex = /^\+([0-9]|\s)+$/

const SmsMfaForm = () => {
  const socialWalletService = useSocialWallet()
  const [submitError, setSubmitError] = useState<string>()
  const [successMsg, setSuccessMsg] = useState<string>()
  const [verificationStarted, setVerificationStarted] = useState(false)
  const [open, setOpen] = useState<boolean>(false)
  const mfaSetup = useMfaStore()

  const currentNumber = mfaSetup?.sms?.number

  const formMethods = useForm<SmsOtpFormData>({
    mode: 'all',
    // If we do not set defaultValues the placeholder will overlap the value.
    defaultValues: {
      [SmsOtpFieldNames.mobileNumber]: obfuscateNumber(currentNumber) ?? '',
      [SmsOtpFieldNames.verificationCode]: undefined,
    },
    // We set values in case the user finishes setting up MFA so that the value gets updates to the obfuscated number
    values: {
      [SmsOtpFieldNames.mobileNumber]: obfuscateNumber(currentNumber) ?? '',
      [SmsOtpFieldNames.verificationCode]: undefined,
    },
  })

  const { formState, handleSubmit, reset, watch, register, getValues, setValue } = formMethods

  const isSmsOtpSet = useMemo(() => {
    return Boolean(mfaSetup?.sms)
  }, [mfaSetup])

  const onRegister = async () => {
    try {
      const mobileNumber = getValues(SmsOtpFieldNames.mobileNumber)
      if (await socialWalletService?.registerSmsOtp(mobileNumber)) {
        setVerificationStarted(true)
      }
    } catch (err) {
      setSubmitError(asError(err).message)
    }
  }

  const onVerify = async () => {
    try {
      const code = getValues(SmsOtpFieldNames.verificationCode)
      const mobileNumber = getValues(SmsOtpFieldNames.mobileNumber)
      if (!code) {
        setSubmitError('You need to provide a 6 digit code')
        return
      }
      if (await socialWalletService?.verifySmsOtp(mobileNumber, code)) {
        onReset()
        setSuccessMsg('Your SMS recovery was setup successfully')
      }
    } catch (err) {
      setSubmitError(asError(err).message)
    }
  }

  // Remove success message after 5s
  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined
    if (successMsg) {
      timeout = setTimeout(() => {
        setSuccessMsg(undefined)
      }, 5000)
    }

    return () => clearTimeout(timeout)
  }, [successMsg])

  const onSubmit = () => {}

  const onReset = () => {
    reset()
    setSubmitError(undefined)
    setSuccessMsg(undefined)
    setVerificationStarted(false)
  }

  const toggleAccordion = () => {
    setOpen((prev) => !prev)
  }

  const onCodeChange = useCallback(
    (code: string) => {
      setValue(SmsOtpFieldNames.verificationCode, code)
    },
    [setValue],
  )

  const { mobileNumber, verificationCode } = watch()

  const isSubmitDisabled =
    !mobileNumber || !formState.isValid || (verificationStarted && verificationCode?.length !== 6)

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Accordion expanded={open} defaultExpanded={false} onChange={toggleAccordion}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <MfaFactorSummary enabled={isSmsOtpSet} label="SMS" />
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Grid container>
              <Grid item container xs={12} md={7} gap={2} p={3}>
                <Box display="flex" flexDirection="column" gap={3}>
                  <Typography>Protect your social login signer with a mobile factor</Typography>
                  <FormControl fullWidth>
                    <TextField
                      placeholder="Your phone number"
                      label="Your phone number"
                      error={Boolean(formState.errors[SmsOtpFieldNames.mobileNumber])}
                      helperText={
                        formState.errors[SmsOtpFieldNames.mobileNumber]?.message ||
                        formState.errors[SmsOtpFieldNames.mobileNumber]?.type === 'pattern'
                          ? 'Invalid phone number'
                          : ''
                      }
                      InputProps={{
                        readOnly: verificationStarted || Boolean(currentNumber),
                      }}
                      InputLabelProps={{
                        shrink: Boolean(mobileNumber),
                      }}
                      {...register(SmsOtpFieldNames.mobileNumber, {
                        required: true,
                        pattern: currentNumber ? undefined : phoneRegex,
                      })}
                    />
                  </FormControl>
                  {verificationStarted && (
                    <Box display="flex" flexDirection="column" gap={1} alignItems="flex-start">
                      <Typography variant="body2" color="text.secondary">
                        Verification code
                      </Typography>
                      <CodeInput length={6} onCodeChanged={onCodeChange} />
                      <Typography variant="caption">
                        Didn&apos;t receive a code?{' '}
                        <CooldownLink cooldown={60} onClick={onRegister} startDisabled={true}>
                          Resend code
                        </CooldownLink>
                      </Typography>
                    </Box>
                  )}

                  {!isSmsOtpSet && (
                    <Box display="flex" justifyContent="space-between" alignItems="center" width={1}>
                      {verificationStarted ? (
                        <>
                          <Button sx={{ fontSize: '14px' }} variant="outlined" onClick={onReset}>
                            Cancel
                          </Button>

                          <Track {...MPC_WALLET_EVENTS.VERIFY_NUMBER}>
                            <Button
                              sx={{ fontSize: '14px' }}
                              disabled={isSubmitDisabled}
                              onClick={onVerify}
                              variant="contained"
                            >
                              Setup SMS factor
                            </Button>
                          </Track>
                        </>
                      ) : (
                        <Track {...MPC_WALLET_EVENTS.REGISTER_NUMBER}>
                          <Button
                            sx={{ fontSize: '14px' }}
                            disabled={isSubmitDisabled}
                            onClick={onRegister}
                            variant="contained"
                          >
                            Setup SMS factor
                          </Button>
                        </Track>
                      )}
                    </Box>
                  )}
                  {submitError && (
                    <Alert severity="error">
                      <AlertTitle>
                        <b>Error</b>
                      </AlertTitle>
                      {submitError}
                    </Alert>
                  )}
                  {successMsg && (
                    <Alert severity="success">
                      <AlertTitle>
                        <b>Success</b>
                      </AlertTitle>
                      {successMsg}
                    </Alert>
                  )}
                  <Alert severity="info">
                    <AlertTitle>
                      <b>Only this number can restore access to your social login signer</b>
                    </AlertTitle>
                    Once you verified this number, it can not be changed anymore.
                  </Alert>
                </Box>
              </Grid>
              <Grid item xs={12} md={5} p={3} sx={{ borderLeft: (theme) => `1px solid ${theme.palette.border.light}` }}>
                <Box>
                  <LockWarningIcon />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Recover your account at any time using an SMS to your phone.
                  </Typography>
                  <ol className={css.list}>
                    <Typography component="li" variant="body2">
                      Register a mobile phone number{' '}
                    </Typography>
                    <Typography component="li" variant="body2">
                      Verify your number by entering the received code
                    </Typography>
                    <Typography component="li" variant="body2">
                      Whenever you login on a new device or browser you can recover your social signer by entering a SMS
                      code
                    </Typography>
                  </ol>
                </Box>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </form>
    </FormProvider>
  )
}

export default SmsMfaForm
