import Track from '@/components/common/Track'
import PasswordInput from '@/components/settings/SecurityLogin/SocialSignerMFA/PasswordInput'
import css from '@/components/settings/SecurityLogin/SocialSignerMFA/styles.module.css'
import useSocialWallet from '@/hooks/wallets/mpc/useSocialWallet'
import BarChartIcon from '@/public/images/common/bar-chart.svg'
import CheckIcon from '@/public/images/common/check-filled.svg'
import LockWarningIcon from '@/public/images/common/lock-warning.svg'
import ShieldOffIcon from '@/public/images/common/shield-off.svg'
import ShieldIcon from '@/public/images/common/shield.svg'
import { MPC_WALLET_EVENTS } from '@/services/analytics/events/mpcWallet'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  SvgIcon,
  Typography,
} from '@mui/material'
import { useRouter } from 'next/router'
import { useMemo, useState, type ChangeEvent } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

enum PasswordFieldNames {
  currentPassword = 'currentPassword',
  newPassword = 'newPassword',
  confirmPassword = 'confirmPassword',
}

type PasswordFormData = {
  [PasswordFieldNames.currentPassword]: string | undefined
  [PasswordFieldNames.newPassword]: string
  [PasswordFieldNames.confirmPassword]: string
}

export enum PasswordStrength {
  strong,
  medium,
  weak,
}

// At least 12 characters, one lowercase, one uppercase, one number, one symbol
const strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{12,})')
// At least 9 characters, one lowercase, one uppercase, one number, one symbol
const mediumPassword = new RegExp('((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{9,}))')

export const _getPasswordStrength = (value: string): PasswordStrength | undefined => {
  if (value === '') return undefined

  if (strongPassword.test(value)) {
    return PasswordStrength.strong
  }

  if (mediumPassword.test(value)) {
    return PasswordStrength.medium
  }

  return PasswordStrength.weak
}

const passwordStrengthMap = {
  [PasswordStrength.strong]: {
    label: 'Strong',
    className: 'strongPassword',
  },
  [PasswordStrength.medium]: {
    label: 'Medium',
    className: 'mediumPassword',
  },
  [PasswordStrength.weak]: {
    label: 'Weak',
    className: 'weakPassword',
  },
} as const

const SocialSignerMFA = () => {
  const router = useRouter()
  const socialWalletService = useSocialWallet()
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>()
  const [submitError, setSubmitError] = useState<string>()
  const [open, setOpen] = useState<boolean>(false)

  const formMethods = useForm<PasswordFormData>({
    mode: 'all',
    defaultValues: {
      [PasswordFieldNames.confirmPassword]: '',
      [PasswordFieldNames.currentPassword]: undefined,
      [PasswordFieldNames.newPassword]: '',
    },
  })

  const { formState, handleSubmit, reset, watch } = formMethods

  const isPasswordSet = useMemo(() => {
    if (!socialWalletService) {
      return false
    }
    return socialWalletService.isRecoveryPasswordSet()
  }, [socialWalletService])

  const onSubmit = async (data: PasswordFormData) => {
    if (!socialWalletService) return

    try {
      await socialWalletService.enableMFA(
        data[PasswordFieldNames.currentPassword],
        data[PasswordFieldNames.newPassword],
      )
      onReset()
      setOpen(false)

      // This is a workaround so that the isPasswordSet and isMFAEnabled state update
      router.reload()
    } catch (e) {
      setSubmitError('The password you entered is incorrect. Please try again.')
    }
  }

  const onReset = () => {
    reset()
    setPasswordStrength(undefined)
    setSubmitError(undefined)
  }

  const toggleAccordion = () => {
    setOpen((prev) => !prev)
  }

  const confirmPassword = watch(PasswordFieldNames.confirmPassword)
  const newPassword = watch(PasswordFieldNames.newPassword)
  const passwordsEmpty = confirmPassword === '' && newPassword === ''
  const passwordsMatch = newPassword === confirmPassword

  const isSubmitDisabled =
    !passwordsMatch ||
    passwordStrength === PasswordStrength.weak ||
    formState.isSubmitting ||
    !formMethods.formState.isValid

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box data-sid="47170" display="flex" flexDirection="column" gap={3} alignItems="baseline">
          <Typography>
            Protect your social login signer with a password. It will be used to restore access in another browser or on
            another device.
          </Typography>
          <Accordion expanded={open} defaultExpanded={false} onChange={toggleAccordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box data-sid="10728" display="flex" alignItems="center" gap={1}>
                <SvgIcon component={CheckIcon} sx={{ color: isPasswordSet ? 'success.main' : 'border.light' }} />
                <Typography fontWeight="bold">Password</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Grid container>
                <Grid item container xs={12} md={7} gap={3} p={3}>
                  {isPasswordSet && (
                    <>
                      <FormControl fullWidth>
                        <PasswordInput
                          name={PasswordFieldNames.currentPassword}
                          placeholder="Current password"
                          label="Current password"
                          helperText={formState.errors[PasswordFieldNames.currentPassword]?.message}
                          required
                        />
                      </FormControl>
                      <Divider sx={{ width: 1 }} />
                    </>
                  )}

                  <FormControl fullWidth>
                    <PasswordInput
                      name={PasswordFieldNames.newPassword}
                      placeholder="New password"
                      label="New password"
                      helperText={formState.errors[PasswordFieldNames.newPassword]?.message}
                      required
                      inputProps={{
                        onChange: (event: ChangeEvent<HTMLInputElement>) => {
                          const value = event.target.value
                          setPasswordStrength(_getPasswordStrength(value))
                        },
                      }}
                    />
                    <Typography
                      variant="body2"
                      display="flex"
                      alignItems="center"
                      gap={1}
                      mt={1}
                      className={
                        passwordStrength !== undefined
                          ? css[passwordStrengthMap[passwordStrength].className]
                          : css.defaultPassword
                      }
                    >
                      <BarChartIcon />
                      {passwordStrength !== undefined
                        ? `${passwordStrengthMap[passwordStrength].label} password`
                        : 'Password strength'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Include at least 9 or more characters, a number, an uppercase letter and a symbol
                    </Typography>
                  </FormControl>

                  <FormControl fullWidth>
                    <PasswordInput
                      name={PasswordFieldNames.confirmPassword}
                      placeholder="Confirm password"
                      label="Confirm password"
                      helperText={formState.errors[PasswordFieldNames.confirmPassword]?.message}
                      required
                    />
                    <Typography
                      variant="body2"
                      display="flex"
                      alignItems="center"
                      gap={1}
                      mt={1}
                      className={
                        passwordsEmpty
                          ? css.passwordsShouldMatch
                          : passwordsMatch
                          ? css.passwordsMatch
                          : css.passwordsNoMatch
                      }
                    >
                      {passwordsEmpty ? (
                        <>
                          <ShieldOffIcon /> Passwords should match
                        </>
                      ) : passwordsMatch ? (
                        <>
                          <ShieldIcon /> Passwords match
                        </>
                      ) : (
                        <>
                          <ShieldOffIcon /> Passwords don&apos;t match
                        </>
                      )}
                    </Typography>
                  </FormControl>

                  {submitError && <Alert severity="error">{submitError}</Alert>}

                  <Box data-sid="61416" display="flex" justifyContent="space-between" width={1}>
                    <Button
                      data-sid="19911"
                      sx={{ fontSize: '14px' }}
                      variant="text"
                      onClick={onReset}
                      disabled={!formState.isDirty}
                    >
                      Cancel
                    </Button>
                    <Track {...MPC_WALLET_EVENTS.UPSERT_PASSWORD}>
                      <Button
                        data-sid="66251"
                        sx={{ fontSize: '14px' }}
                        disabled={isSubmitDisabled}
                        type="submit"
                        variant="contained"
                      >
                        {isPasswordSet ? 'Change' : 'Create'} Password
                      </Button>
                    </Track>
                  </Box>
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
                      You won&apos;t be able to restore this password
                    </Typography>
                    <ol className={css.list}>
                      <Typography component="li" variant="body2">
                        You will have to input this password if you login with this social login signer in another
                        browser or on another device.
                      </Typography>
                      <Typography component="li" variant="body2">
                        We suggest to use a password manager or to write the password down on a piece of paper and
                        secure it.
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

export default SocialSignerMFA
