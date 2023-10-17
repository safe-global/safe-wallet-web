import { SecurityQuestionRecovery } from '@/hooks/wallets/mpc/recovery/SecurityQuestionRecovery'
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
  Divider,
} from '@mui/material'
import { useState, useMemo, type ChangeEvent } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { enableMFA } from './helper'
import CheckIcon from '@/public/images/common/check-filled.svg'
import LockWarningIcon from '@/public/images/common/lock-warning.svg'
import PasswordInput from '@/components/settings/SignerAccountMFA/PasswordInput'
import css from './styles.module.css'
import BarChartIcon from '@/public/images/common/bar-chart.svg'
import ShieldIcon from '@/public/images/common/shield.svg'
import ShieldOffIcon from '@/public/images/common/shield-off.svg'
import useMPC from '@/hooks/wallets/mpc/useMPC'
import { useAppDispatch } from '@/store'

enum PasswordFieldNames {
  oldPassword = 'oldPassword',
  newPassword = 'newPassword',
  confirmPassword = 'confirmPassword',
}

type PasswordFormData = {
  [PasswordFieldNames.oldPassword]: string | undefined
  [PasswordFieldNames.newPassword]: string
  [PasswordFieldNames.confirmPassword]: string
}

enum PasswordStrength {
  strong,
  medium,
  weak,
}

// At least 8 characters, one lowercase, one uppercase, one number, one symbol
const strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})')
// At least 8 characters without a symbol
const mediumPassword = new RegExp('((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,}))')

export const PasswordForm = () => {
  const dispatch = useAppDispatch()
  const mpcCoreKit = useMPC()
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(PasswordStrength.weak)
  const [passwordsMatch, setPasswordsMatch] = useState<boolean>(false)

  const formMethods = useForm<PasswordFormData>({
    mode: 'all',
    defaultValues: {
      [PasswordFieldNames.confirmPassword]: '',
      [PasswordFieldNames.oldPassword]: undefined,
      [PasswordFieldNames.newPassword]: '',
    },
  })

  const { formState, getValues, handleSubmit, reset } = formMethods

  const isPasswordSet = useMemo(() => {
    if (!mpcCoreKit) return false

    const securityQuestions = new SecurityQuestionRecovery(mpcCoreKit)
    return securityQuestions.isEnabled()
  }, [mpcCoreKit])

  const onSubmit = async (data: PasswordFormData) => {
    if (!mpcCoreKit) return

    await enableMFA(dispatch, mpcCoreKit, data)
    reset()
  }

  const onReset = () => {
    reset()
  }

  const isSubmitDisabled =
    !passwordsMatch ||
    passwordStrength !== PasswordStrength.strong ||
    formState.isSubmitting ||
    !formMethods.formState.isValid

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" flexDirection="column" gap={3} alignItems="baseline">
          <Typography>
            Protect your account with a password. It will be used to restore access to your Safe in another browser or
            on another device.
          </Typography>
          <Accordion expanded={isPasswordSet}>
            <AccordionSummary>
              <Box display="flex" alignItems="center" gap={1}>
                <SvgIcon component={CheckIcon} sx={{ color: isPasswordSet ? 'success.main' : 'border.light' }} />
                <Typography fontWeight="bold">Password</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Grid container>
                <Grid item container xs={12} md={7} gap={3} p={3}>
                  {isPasswordSet && (
                    <>
                      <Typography>You already have a recovery password setup.</Typography>
                      <FormControl fullWidth>
                        <PasswordInput
                          name={PasswordFieldNames.oldPassword}
                          placeholder="Old password"
                          label="Old password"
                          helperText={formState.errors[PasswordFieldNames.oldPassword]?.message}
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
                          const confirmNewPW = getValues(PasswordFieldNames.confirmPassword)
                          const value = event.target.value
                          setPasswordsMatch(value !== '' && value === confirmNewPW)

                          if (strongPassword.test(value)) {
                            setPasswordStrength(PasswordStrength.strong)
                          } else if (mediumPassword.test(value)) {
                            setPasswordStrength(PasswordStrength.medium)
                          } else {
                            setPasswordStrength(PasswordStrength.weak)
                          }
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
                        passwordStrength === PasswordStrength.strong
                          ? css.strongPassword
                          : passwordStrength === PasswordStrength.medium
                          ? css.mediumPassword
                          : css.weakPassword
                      }
                    >
                      <BarChartIcon />
                      {passwordStrength === PasswordStrength.strong
                        ? 'Strong'
                        : passwordStrength === PasswordStrength.medium
                        ? 'Medium'
                        : 'Weak'}{' '}
                      password
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      Include at least 8 or more characters, a number, an uppercase letter and a symbol
                    </Typography>
                  </FormControl>

                  <FormControl fullWidth>
                    <PasswordInput
                      name={PasswordFieldNames.confirmPassword}
                      placeholder="Confirm new password"
                      label="Confirm new password"
                      helperText={formState.errors[PasswordFieldNames.confirmPassword]?.message}
                      inputProps={{
                        onChange: (event: ChangeEvent<HTMLInputElement>) => {
                          const currentNewPW = getValues(PasswordFieldNames.newPassword)
                          setPasswordsMatch(event.target.value === currentNewPW)
                        },
                      }}
                      required
                    />
                    <Typography
                      variant="body2"
                      display="flex"
                      alignItems="center"
                      gap={1}
                      mt={1}
                      className={passwordsMatch ? css.passwordsMatch : css.passwordsNoMatch}
                    >
                      {passwordsMatch ? (
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

                  <Button variant="text" onClick={onReset} disabled={!formState.isDirty}>
                    Cancel
                  </Button>
                  <Button
                    sx={{ justifySelf: 'flex-end', marginLeft: 'auto', fontSize: '14px' }}
                    disabled={isSubmitDisabled}
                    type="submit"
                    variant="contained"
                  >
                    {isPasswordSet ? 'Change' : 'Create'} Password
                  </Button>
                </Grid>
                <Grid item xs={12} md={5} p={3} sx={{ borderLeft: '1px solid #DCDEE0' }}>
                  <Box>
                    <LockWarningIcon />
                    <Typography variant="subtitle1" fontWeight="bold">
                      You won&apos;t be able to restore this password
                    </Typography>
                    <ol className={css.list}>
                      <Typography component="li" variant="body2">
                        You will have to input this password if you need to recover access to Safe in another browser or
                        on another device.
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
