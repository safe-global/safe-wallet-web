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
  SvgIcon,
  Alert,
  TextField,
} from '@mui/material'
import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'
import { useRouter } from 'next/router'
import { useState, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import CheckIcon from '@/public/images/common/check-filled.svg'
import LockWarningIcon from '@/public/images/common/lock-warning.svg'
import css from './styles.module.css'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import useSocialWallet from '@/hooks/wallets/mpc/useSocialWallet'
import { obfuscateNumber } from '@/utils/phoneNumber'
import { asError } from '@/services/exceptions/utils'
import CodeInput from '@/components/common/CodeInput'
import CooldownButton from '@/components/common/CooldownButton'

enum SmsOtpFieldNames {
  mobileNumber = 'mobileNumber',
  verificationCode = 'verificationCode',
}

type SmsOtpFormData = {
  [SmsOtpFieldNames.mobileNumber]: string
  [SmsOtpFieldNames.verificationCode]: string | undefined
}

const SmsMfaForm = () => {
  const router = useRouter()
  const socialWalletService = useSocialWallet()
  const [submitError, setSubmitError] = useState<string>()
  const [successMsg, setSuccessMsg] = useState<string>()
  const [verificationStarted, setVerificationStarted] = useState(false)
  const [open, setOpen] = useState<boolean>(false)

  const currentNumber = socialWalletService?.getSmsRecoveryNumber()

  const formMethods = useForm<SmsOtpFormData>({
    mode: 'all',
    defaultValues: {
      [SmsOtpFieldNames.mobileNumber]: obfuscateNumber(currentNumber) ?? '+49',
      [SmsOtpFieldNames.verificationCode]: undefined,
    },
  })

  const { formState, handleSubmit, reset, watch, register, getValues, setValue } = formMethods

  const isSmsOtpSet = useMemo(() => {
    return socialWalletService?.isSmsOtpEnabled()
  }, [socialWalletService])

  const onRegister = async () => {
    try {
      const mobileNumber = getValues(SmsOtpFieldNames.mobileNumber)
      if (await socialWalletService?.registerSmsOtp(mobileNumber)) {
        setVerificationStarted(true)
      }
    } catch (err) {
      setSubmitError(`Error registering this phone number: ${asError(err).message}`)
    }
  }

  const onVerify = async () => {
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
  }

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

  const mobileNumber = watch(SmsOtpFieldNames.mobileNumber)

  const isSubmitDisabled = !mobileNumber

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" flexDirection="column" gap={3} alignItems="baseline">
          <Typography>Protect your social login signer with mobile recovery</Typography>
          <Accordion expanded={open} defaultExpanded={false} onChange={toggleAccordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                <SvgIcon component={CheckIcon} sx={{ color: isSmsOtpSet ? 'success.main' : 'border.light' }} />
                <Typography fontWeight="bold">SMS recovery</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Grid container>
                <Grid item container xs={12} md={7} gap={3} p={3}>
                  <FormControl fullWidth>
                    <TextField
                      placeholder="Mobile number"
                      label="Mobile number"
                      helperText={formState.errors[SmsOtpFieldNames.mobileNumber]?.message}
                      InputProps={{
                        readOnly: verificationStarted || Boolean(currentNumber),
                      }}
                      {...register(SmsOtpFieldNames.mobileNumber, {
                        required: true,
                      })}
                    />
                  </FormControl>
                  {verificationStarted && (
                    <Box display="flex" flexDirection="column" gap={1} alignItems="flex-start">
                      <Typography variant="h4">Verification code</Typography>
                      <CodeInput
                        length={6}
                        onCodeChanged={(code: string) => setValue(SmsOtpFieldNames.verificationCode, code)}
                      />
                      <CooldownButton cooldown={60} onClick={onRegister} startDisabled={true}>
                        Resend code
                      </CooldownButton>
                    </Box>
                  )}

                  {submitError && <Alert severity="error">{submitError}</Alert>}
                  {successMsg && <Alert severity="success">{successMsg}</Alert>}

                  {!isSmsOtpSet && (
                    <Box display="flex" justifyContent="space-between" alignItems="center" width={1}>
                      <Button sx={{ fontSize: '14px' }} variant="text" onClick={onReset} disabled={!formState.isDirty}>
                        Cancel
                      </Button>
                      {/* TODO: CHANGE TRACKING EVENT */}
                      {verificationStarted ? (
                        <Track {...MPC_WALLET_EVENTS.UPSERT_PASSWORD}>
                          <Button
                            sx={{ fontSize: '14px' }}
                            disabled={isSubmitDisabled}
                            onClick={onVerify}
                            variant="contained"
                          >
                            Verify number
                          </Button>
                        </Track>
                      ) : (
                        <Track {...MPC_WALLET_EVENTS.UPSERT_PASSWORD}>
                          <Button
                            sx={{ fontSize: '14px' }}
                            disabled={isSubmitDisabled}
                            onClick={onRegister}
                            variant="contained"
                          >
                            Register
                          </Button>
                        </Track>
                      )}
                    </Box>
                  )}
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={5}
                  p={3}
                  sx={{ borderLeft: (theme) => `1px solid ${theme.palette.border.light}` }}
                >
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
                        Whenever you login on a new device or browser you can recover your social signer by entering a
                        SMS code
                      </Typography>
                    </ol>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Box>
      </form>
    </FormProvider>
  )
}

export default SmsMfaForm
