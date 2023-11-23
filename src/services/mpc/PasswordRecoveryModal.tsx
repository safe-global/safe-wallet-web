import { PasswordRecovery } from '@/components/common/SocialSigner/PasswordRecovery'
import { SmsRecovery } from '@/components/common/SocialSigner/SmsRecovery'
import TxModalDialog from '@/components/common/TxModalDialog'
import { IS_PRODUCTION } from '@/config/constants'
import useSocialWallet from '@/hooks/wallets/mpc/useSocialWallet'
import ExternalStore from '@/services/ExternalStore'
import { Box, Button, Divider, Grid, Typography } from '@mui/material'
import { useCallback, useState } from 'react'

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
    <Grid container justifyContent="center" alignItems="center">
      <Grid item xs={12} md={5} p={2}>
        <Typography variant="h2" fontWeight="bold" mb={3}>
          Verify your account
        </Typography>
        <Box bgcolor="background.paper" borderRadius={1}>
          <Box p={4}>
            <Typography variant="h4" fontWeight="bold" mb={2}>
              Choose your recovery method
            </Typography>
            <Typography>
              This browser is not registered with your Account yet. Please proceed with one of your setup recovery
              methods.
            </Typography>
          </Box>
          <Divider />
          <Box p={4}>
            <Typography>Use your mobile phone</Typography>
            <Button onClick={() => setRecoveryMethod(RecoveryMethod.SMS)} disabled={!smsEnabled} variant="contained">
              SMS
            </Button>

            <Typography mt={3}>Use your recovery password</Typography>
            <Button
              onClick={() => setRecoveryMethod(RecoveryMethod.PASSWORD)}
              disabled={!passwordEnabled}
              variant="contained"
            >
              Password
            </Button>

            {!IS_PRODUCTION && (
              <>
                <Typography mt={3}>Only in Dev / Staging</Typography>
                <Button onClick={deleteAccount} variant="danger">
                  Delete account
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Grid>
    </Grid>
  )
}

const SocialRecoveryModal = () => {
  const socialWalletService = useSocialWallet()
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>()
  const closeCallback = useCloseCallback()
  const open = !!closeCallback

  const passwordEnabled = socialWalletService?.isRecoveryPasswordSet() ?? false
  const smsEnabled = socialWalletService?.isSmsOtpEnabled() ?? false

  const recoverPassword = async (password: string, storeDeviceFactor: boolean) => {
    if (!socialWalletService) return

    await socialWalletService.recoverAccountWithPassword(password, storeDeviceFactor)
  }

  const recoverSms = async (code: string, storeDeviceFactor: boolean) => {
    if (!socialWalletService) return

    const number = socialWalletService.getSmsRecoveryNumber()
    if (!number) {
      throw new Error('No recovery mobile number is set')
    }
    await socialWalletService.recoverAccountWithSms(number, code, storeDeviceFactor)
  }

  const deleteAccount = () => {
    if (!socialWalletService) return

    socialWalletService.__deleteAccount()
  }

  const sendSmsCode = useCallback(async () => {
    if (!socialWalletService) return

    const number = socialWalletService.getSmsRecoveryNumber()
    if (!number) {
      throw new Error('No recovery mobile number is set')
    }
    await socialWalletService.registerSmsOtp(number)
  }, [socialWalletService])

  const handleClose = () => {
    closeCallback?.()
    setRecoveryMethod(undefined)
    setCloseCallback(undefined)
    close()
  }

  const handleBack = () => {
    setRecoveryMethod(undefined)
  }

  const RecoveryComponentMap: Record<RecoveryMethod, () => React.ReactElement> = {
    [RecoveryMethod.PASSWORD]: () => (
      <PasswordRecovery recoverFactorWithPassword={recoverPassword} onSuccess={handleClose} onBack={handleBack} />
    ),
    [RecoveryMethod.SMS]: () => (
      <SmsRecovery
        sendSmsCode={sendSmsCode}
        recoverFactorWithSms={recoverSms}
        onSuccess={handleClose}
        onBack={handleBack}
      />
    ),
  }

  if (!open) return null

  return (
    <TxModalDialog open={open} onClose={handleClose} fullWidth sx={{ zIndex: '10000 !important', top: '0 !important' }}>
      {recoveryMethod !== undefined ? (
        RecoveryComponentMap[recoveryMethod]()
      ) : (
        <RecoveryPicker
          passwordEnabled={passwordEnabled}
          smsEnabled={smsEnabled}
          setRecoveryMethod={setRecoveryMethod}
          deleteAccount={deleteAccount}
        />
      )}
    </TxModalDialog>
  )
}

export default SocialRecoveryModal
