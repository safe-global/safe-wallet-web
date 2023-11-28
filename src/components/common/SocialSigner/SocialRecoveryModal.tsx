import { PasswordRecovery } from '@/components/common/SocialSigner/PasswordRecovery'
import { SmsRecovery } from '@/components/common/SocialSigner/SmsRecovery'
import TxModalDialog from '@/components/common/TxModalDialog'
import { IS_PRODUCTION } from '@/config/constants'
import useSocialWallet, { useMfaStore } from '@/hooks/wallets/mpc/useSocialWallet'
import ExternalStore from '@/services/ExternalStore'
import { Avatar, Box, Button, Divider, Grid, LinearProgress, Typography } from '@mui/material'
import { type ReactNode, useCallback, useState } from 'react'
import css from './styles.module.css'

const { useStore: useCloseCallback, setStore: setCloseCallback } = new ExternalStore<() => void>()

enum RecoveryMethod {
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

const RecoveryPicker = ({
  smsEnabled,
  passwordEnabled,
  setRecoveryMethod,
  deleteAccount,
}: {
  smsEnabled: boolean
  passwordEnabled: boolean
  setRecoveryMethod: (method: RecoveryMethod) => void
  deleteAccount?: () => void
}) => {
  return (
    <Box>
      <Box p={4}>
        <Box display="flex" flexDirection="row" gap={1} alignItems="center" mb={0.5}>
          <Avatar className={css.dot}>
            <Typography variant="body2">{2}</Typography>
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Choose your recovery method
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" pl={'28px'}>
          How would you like to recovery your social login signer?
        </Typography>
      </Box>
      <Divider />
      <Box p={4} display="flex" gap={2} flexDirection="column">
        <Button
          sx={{ height: '64px' }}
          onClick={() => setRecoveryMethod(RecoveryMethod.SMS)}
          disabled={!smsEnabled}
          variant="outlined"
        >
          SMS
        </Button>

        <Button
          sx={{ height: '64px' }}
          onClick={() => setRecoveryMethod(RecoveryMethod.PASSWORD)}
          disabled={!passwordEnabled}
          variant="outlined"
        >
          Password
        </Button>

        {!IS_PRODUCTION && (
          <Button onClick={deleteAccount} variant="danger" sx={{ height: '64px' }}>
            Delete account
          </Button>
        )}
      </Box>
    </Box>
  )
}

const SocialRecoveryModal = () => {
  const socialWalletService = useSocialWallet()
  const mfaSetup = useMfaStore()
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>()
  const [isRecovering, setIsRecovering] = useState(false)
  const closeCallback = useCloseCallback()
  const open = !!closeCallback

  const passwordEnabled = Boolean(mfaSetup?.password)
  const smsEnabled = Boolean(mfaSetup?.sms)

  const recoverPassword = async (password: string, storeDeviceFactor: boolean) => {
    if (!socialWalletService) return

    setIsRecovering(true)
    try {
      await socialWalletService.recoverAccountWithPassword(password, storeDeviceFactor)
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
          <RecoveryPicker
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
