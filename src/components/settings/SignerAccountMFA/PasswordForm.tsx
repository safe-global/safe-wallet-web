import { SecurityQuestionRecovery } from '@/hooks/wallets/mpc/recovery/SecurityQuestionRecovery'
import { Typography, TextField, Button, Box } from '@mui/material'
import { type Web3AuthMPCCoreKit } from '@web3auth/mpc-core-kit'
import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { enableMFA } from './helper'

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

  const { register, formState, getValues, handleSubmit } = formMethods

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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box display="flex" flexDirection="column" gap={3} alignItems="baseline">
        {isPasswordSet ? (
          <Typography>You already have a recovery password setup.</Typography>
        ) : (
          <Typography>You have no password setup. We suggest adding one to secure your Account.</Typography>
        )}
        {isPasswordSet && (
          <TextField
            placeholder="Old password"
            label="Old password"
            type="password"
            error={!!formState.errors[PasswordFieldNames.oldPassword]}
            helperText={formState.errors[PasswordFieldNames.oldPassword]?.message}
            {...register(PasswordFieldNames.oldPassword, {
              required: true,
            })}
          />
        )}
        <TextField
          placeholder="New password"
          label="New password"
          type="password"
          error={!!formState.errors[PasswordFieldNames.newPassword]}
          helperText={formState.errors[PasswordFieldNames.newPassword]?.message}
          {...register(PasswordFieldNames.newPassword, {
            required: true,
            minLength: 6,
          })}
        />
        <TextField
          placeholder="Confirm new password"
          label="Confirm new password"
          type="password"
          error={!!formState.errors[PasswordFieldNames.confirmPassword]}
          helperText={formState.errors[PasswordFieldNames.confirmPassword]?.message}
          {...register(PasswordFieldNames.confirmPassword, {
            required: true,
            validate: (value: string) => {
              const currentNewPW = getValues(PasswordFieldNames.newPassword)
              if (value !== currentNewPW) {
                return 'Passwords do not match'
              }
            },
          })}
        />

        <Button
          variant="contained"
          sx={{ justifySelf: 'flex-start' }}
          disabled={!formMethods.formState.isValid || enablingMFA}
          type="submit"
        >
          {isPasswordSet ? 'Change' : 'Set'} Password
        </Button>
      </Box>
    </form>
  )
}
