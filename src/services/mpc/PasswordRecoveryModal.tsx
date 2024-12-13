import { PasswordRecovery } from '@/components/common/SocialSigner/PasswordRecovery'
import TxModalDialog from '@/components/common/TxModalDialog'
import useSocialWallet from '@/hooks/wallets/mpc/useSocialWallet'
import ExternalStore from '@/services/ExternalStore'

const { useStore: useCloseCallback, setStore: setCloseCallback } = new ExternalStore<() => void>()

export const open = (cb: () => void) => {
  setCloseCallback(() => cb)
}

export const close = () => {
  setCloseCallback(undefined)
}

const PasswordRecoveryModal = () => {
  const socialWalletService = useSocialWallet()
  const closeCallback = useCloseCallback()
  const open = !!closeCallback

  const handleClose = () => {
    closeCallback?.()
    setCloseCallback(undefined)
    close()
  }

  const recoverPassword = async (password: string, storeDeviceFactor: boolean) => {
    if (!socialWalletService) return

    await socialWalletService.recoverAccountWithPassword(password, storeDeviceFactor)
  }

  if (!open) return null

  return (
    <TxModalDialog open={open} onClose={handleClose} fullWidth sx={{ zIndex: '10000 !important', top: '0 !important' }}>
      <PasswordRecovery recoverFactorWithPassword={recoverPassword} onSuccess={handleClose} />
    </TxModalDialog>
  )
}

export default PasswordRecoveryModal
