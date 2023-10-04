import useMPC from '@/hooks/wallets/mpc/useMPC'
import { Box, Button, Checkbox, FormControlLabel, TextField, Typography } from '@mui/material'
import { COREKIT_STATUS } from '@web3auth/mpc-core-kit'
import { getPubKeyPoint } from '@tkey-mpc/common-types'
import { BN } from 'bn.js'
import { useEffect, useMemo, useState } from 'react'
import { useSecurityQuestions } from '@/hooks/wallets/mpc/recovery/useSecurityQuestions'
import useMFASettings from './useMFASettings'
import { useForm } from 'react-hook-form'
import { useDeviceShare } from '@/hooks/wallets/mpc/recovery/useDeviceShare'

type SignerAccountFormData = {
  oldPassword: string | undefined
  newPassword: string
  confirmPassword: string
  storeDeviceShare: boolean
}

const SignerAccountMFA = () => {
  const mpcCoreKit = useMPC()
  const mfaSettings = useMFASettings(mpcCoreKit)
  const securityQuestions = useSecurityQuestions(mpcCoreKit)
  const deviceShareModule = useDeviceShare(mpcCoreKit)

  const formMethods = useForm<SignerAccountFormData>({
    mode: 'all',
  })

  const { register, formState, watch, setValue, handleSubmit } = formMethods

  const [enablingMFA, setEnablingMFA] = useState(false)

  const isPasswordSet = useMemo(() => securityQuestions.isEnabled(), [securityQuestions])

  console.log(mpcCoreKit)

  useEffect(() => {
    deviceShareModule.isEnabled().then((value) => setValue('storeDeviceShare', value))
  }, [deviceShareModule, setValue])

  const enableMFA = async () => {
    if (!mpcCoreKit) {
      return
    }

    setEnablingMFA(true)
    try {
      const { newPassword, oldPassword, storeDeviceShare } = formMethods.getValues()
      // 1. setup device factor with password recovery
      await securityQuestions.upsertPassword(newPassword, oldPassword)
      const securityQuestionFactor = await securityQuestions.recoverWithPassword(newPassword)
      if (!securityQuestionFactor) {
        throw Error('Could not recover using the new password recovery')
      }

      if (!mfaSettings?.mfaEnabled) {
        // 2. enable MFA in mpcCoreKit
        const recoveryFactor = await mpcCoreKit.enableMFA({})

        // 3. remove the recovery factor the mpcCoreKit creates
        const recoverKey = new BN(recoveryFactor, 'hex')
        const recoverPubKey = getPubKeyPoint(recoverKey)
        await mpcCoreKit.deleteFactor(recoverPubKey, recoverKey)
      }

      const hasDeviceShare = await deviceShareModule.isEnabled()

      if (!hasDeviceShare && storeDeviceShare) {
        await deviceShareModule.createAndStoreDeviceFactor()
      }

      if (hasDeviceShare && !storeDeviceShare) {
        // Switch to password recovery factor such that we can delete the device factor
        await mpcCoreKit.inputFactorKey(new BN(securityQuestionFactor, 'hex'))
        await deviceShareModule.removeDeviceFactor()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setEnablingMFA(false)
    }
  }

  if (mpcCoreKit?.status !== COREKIT_STATUS.LOGGED_IN) {
    return (
      <Box>
        <Typography>You are currently not logged in with a social account</Typography>
      </Box>
    )
  }

  const onSubmit = async () => {
    console.log('submitting')
    await enableMFA()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box display="flex" flexDirection="column" gap={3} alignItems="baseline">
        {
          /* TODO: Memoize this*/ securityQuestions.isEnabled() ? (
            <Typography>You already have a recovery password setup.</Typography>
          ) : (
            <Typography>You have no password setup. Secure your account now!</Typography>
          )
        }
        {isPasswordSet && (
          <TextField
            placeholder="Old password"
            label="Old password"
            type="password"
            error={!!formState.errors['oldPassword']}
            helperText={formState.errors['oldPassword']?.message}
            {...register('oldPassword', {
              required: securityQuestions.isEnabled(),
            })}
          />
        )}
        <TextField
          placeholder="New password"
          label="New password"
          type="password"
          error={!!formState.errors['newPassword']}
          helperText={formState.errors['newPassword']?.message}
          {...register('newPassword', {
            required: true,
            minLength: 6,
          })}
        />
        <TextField
          placeholder="Confirm new password"
          label="Confirm new password"
          type="password"
          error={!!formState.errors['confirmPassword']}
          helperText={formState.errors['confirmPassword']?.message}
          {...register('confirmPassword', {
            required: true,
            validate: (value: string) => {
              const currentNewPW = watch('newPassword')
              if (value !== currentNewPW) {
                return 'Passwords do not match'
              }
            },
          })}
        />

        <FormControlLabel
          control={<Checkbox {...register('storeDeviceShare')} />}
          label="Do not ask for second factor on this device"
        />

        <Button
          sx={{ justifySelf: 'flex-start' }}
          disabled={!formMethods.formState.isValid || enablingMFA}
          type="submit"
        >
          Change
        </Button>
      </Box>
    </form>
  )
}

export default SignerAccountMFA
