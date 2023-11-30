import { PasswordRecovery } from '@/components/common/SocialSigner/recovery/PasswordRecovery'
import { SmsRecovery } from '@/components/common/SocialSigner/recovery/SmsRecovery'
import TxModalDialog from '@/components/common/TxModalDialog'
import useSocialWallet, { useMfaStore } from '@/hooks/wallets/mpc/useSocialWallet'
import ExternalStore from '@/services/ExternalStore'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import { Box, Grid, LinearProgress, Typography } from '@mui/material'
import { type ReactNode, useCallback, useState } from 'react'
import { PickRecoveryMethod } from './PickRecoveryMethod'

const { useStore: useCloseCallback, setStore: setCloseCallback } = new ExternalStore<() => void>()

export enum RecoveryMethod {
  PASSWORD,
  SMS,
}

export const open = (cb: () => void) => {
  setCloseCallback(() => cb)
}

export const close = () => {
  setCloseCallback(undefined)
}

const RecoveryFlow = ({
  children,
  progress,
  isRecovering,
}: {
  children: ReactNode
  progress: number
  isRecovering: boolean
}) => {
  return (
    <Grid container justifyContent="center" alignItems="center">
      <Grid item xs={12} md={5} p={2}>
        <Typography variant="h2" fontWeight="bold" mb={3}>
          Verify your account
        </Typography>
        <Box bgcolor="background.paper" borderRadius={1}>
          <LinearProgress
            variant={isRecovering ? 'indeterminate' : 'determinate'}
            color="secondary"
            sx={{ borderTopLeftRadius: '6px', borderTopRightRadius: '6px' }}
            value={progress}
          />
          {children}
        </Box>
      </Grid>
    </Grid>
  )
}

const SocialRecoveryModal = () => {
  const socialWalletService = useSocialWallet()
  const mfaSetup = useMfaStore()
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>()
  const [isRecovering, setIsRecovering] = useState(false)
  const closeCallback = useCloseCallback()
  const open = !!closeCallback
  const dispatch = useAppDispatch()

  const passwordEnabled = Boolean(mfaSetup?.password)
  const smsEnabled = Boolean(mfaSetup?.sms)

  const onSuccess = () => {
    dispatch(
      showNotification({
        title: 'Social login signer recovered',
        message: "Your social login signer recovery is complete and you're are back in control!",
        groupKey: 'social-login-signer-recovery',
        variant: 'success',
      }),
    )
  }

  const recoverPassword = async (password: string, storeDeviceFactor: boolean) => {
    if (!socialWalletService) return

    setIsRecovering(true)
    try {
      await socialWalletService.recoverAccountWithPassword(password, storeDeviceFactor)
      onSuccess()
    } finally {
      setIsRecovering(false)
    }
  }

  const recoverSms = async (code: string, storeDeviceFactor: boolean) => {
    if (!socialWalletService) return

    const number = socialWalletService.getSmsRecoveryNumber()
    if (!number) {
      throw new Error('No recovery mobile number is set')
    }
    setIsRecovering(true)
    try {
      await socialWalletService.recoverAccountWithSms(number, code, storeDeviceFactor)
      onSuccess()
    } finally {
      setIsRecovering(false)
    }
  }

  const deleteAccount = () => {
    if (!socialWalletService) return

    socialWalletService.__deleteAccount()
  }

  const sendSmsCode = useCallback(async () => {
    if (!socialWalletService) return

    const number = mfaSetup?.sms?.number
    if (!number) {
      throw new Error('No recovery mobile number is set')
    }
    await socialWalletService.registerSmsOtp(number)
  }, [socialWalletService, mfaSetup])

  const handleClose = () => {
    closeCallback?.()
    setRecoveryMethod(undefined)
    setCloseCallback(undefined)
    close()
  }

  const handleBack = () => {
    setRecoveryMethod(undefined)
  }

  const RecoveryComponentMap: Record<RecoveryMethod, React.ReactElement> = {
    [RecoveryMethod.PASSWORD]: (
      <PasswordRecovery recoverFactorWithPassword={recoverPassword} onSuccess={handleClose} onBack={handleBack} />
    ),
    [RecoveryMethod.SMS]: (
      <SmsRecovery
        sendSmsCode={sendSmsCode}
        recoverFactorWithSms={recoverSms}
        onSuccess={handleClose}
        onBack={handleBack}
        phoneNumber={mfaSetup?.sms?.number}
      />
    ),
  }

  if (!open) return null

  return (
    <TxModalDialog open={open} onClose={handleClose} fullWidth sx={{ zIndex: '10000 !important', top: '0 !important' }}>
      <RecoveryFlow progress={recoveryMethod ? 75 : 25} isRecovering={isRecovering}>
        {recoveryMethod !== undefined ? (
          RecoveryComponentMap[recoveryMethod]
        ) : (
          <PickRecoveryMethod
            passwordEnabled={passwordEnabled}
            smsEnabled={smsEnabled}
            setRecoveryMethod={setRecoveryMethod}
            deleteAccount={deleteAccount}
          />
        )}
      </RecoveryFlow>
    </TxModalDialog>
  )
}

export default SocialRecoveryModal
