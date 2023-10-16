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
import { type Web3AuthMPCCoreKit } from '@web3auth/mpc-core-kit'
import { useState, useMemo } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { enableMFA } from './helper'
import CheckIcon from '@/public/images/common/check-filled.svg'
import LockWarningIcon from '@/public/images/common/lock-warning.svg'
import PasswordInput from '@/components/settings/SignerAccountMFA/PasswordInput'
import css from './styles.module.css'

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

export const PasswordForm = ({ mpcCoreKit }: { mpcCoreKit: Web3AuthMPCCoreKit }) => {
  const formMethods = useForm<PasswordFormData>({
    mode: 'all',
    defaultValues: {
      [PasswordFieldNames.confirmPassword]: '',
      [PasswordFieldNames.oldPassword]: undefined,
      [PasswordFieldNames.newPassword]: '',
    },
  })

  const { formState, getValues, handleSubmit } = formMethods

  const [enablingMFA, setEnablingMFA] = useState(false)

  const isPasswordSet = useMemo(() => {
    const securityQuestions = new SecurityQuestionRecovery(mpcCoreKit)
    return securityQuestions.isEnabled()
  }, [mpcCoreKit])

  const onSubmit = async (data: PasswordFormData) => {
    setEnablingMFA(true)
    try {
      await enableMFA(mpcCoreKit, data)
    } finally {
      setEnablingMFA(false)
    }
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" flexDirection="column" gap={3} alignItems="baseline">
          {isPasswordSet ? (
            <Typography>You already have a recovery password setup.</Typography>
          ) : (
            <Typography>You have no password setup. We suggest adding one to secure your Account.</Typography>
          )}
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
                  <Typography>
                    Your password will be used to access your social key and serve as a recovery factor.
                  </Typography>
                  {isPasswordSet && (
                    <>
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
                    />
                  </FormControl>

                  <FormControl fullWidth>
                    <PasswordInput
                      name={PasswordFieldNames.confirmPassword}
                      placeholder="Confirm new password"
                      label="Confirm new password"
                      helperText={formState.errors[PasswordFieldNames.confirmPassword]?.message}
                      validate={(value: string) => {
                        const currentNewPW = getValues(PasswordFieldNames.newPassword)
                        if (value !== currentNewPW) {
                          return 'Passwords do not match'
                        }
                      }}
                      required
                    />
                  </FormControl>

                  <Button
                    sx={{ justifySelf: 'flex-end', marginLeft: 'auto', fontSize: '14px' }}
                    disabled={!formMethods.formState.isValid || enablingMFA}
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
