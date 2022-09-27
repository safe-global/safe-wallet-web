import { hasStoredPairingSession } from '@/services/pairing/connector'
import { PAIRING_MODULE_LABEL } from '@/services/pairing/module'

const isKeystoneError = (err: unknown): boolean => {
  if (err instanceof Error) {
    return err.message?.startsWith('#ktek_error')
  }
  return false
}

const isWCRejection = (err: Error): boolean => {
  return /User rejected/.test(err?.message)
}

const isMMRejection = (err: Error & { code?: number }): boolean => {
  const METAMASK_REJECT_CONFIRM_TX_ERROR_CODE = 4001

  return err.code === METAMASK_REJECT_CONFIRM_TX_ERROR_CODE
}

export const isWalletRejection = (err: Error & { code?: number }): boolean => {
  return isMMRejection(err) || isWCRejection(err) || isKeystoneError(err)
}

const WalletNames = {
  METAMASK: 'MetaMask',
  WALLET_CONNECT: 'WalletConnect',
  SAFE_MOBILE_PAIRING: PAIRING_MODULE_LABEL,
}

/* Check if the wallet is unlocked. */
export const isWalletUnlocked = async (walletName: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false

  // Only MetaMask exposes a method to check if the wallet is unlocked
  if (walletName === WalletNames.METAMASK) {
    return window.ethereum?._metamask?.isUnlocked() || false
  }

  // Wallet connect creates a localStorage entry when connected and removes it when disconnected
  if (walletName === WalletNames.WALLET_CONNECT) {
    return window.localStorage.getItem('walletconnect') !== null
  }

  // Our own Safe mobile pairing module
  if (walletName === WalletNames.SAFE_MOBILE_PAIRING && hasStoredPairingSession()) {
    return hasStoredPairingSession()
  }

  return false
}
