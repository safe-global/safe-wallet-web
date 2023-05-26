import { ProviderLabel } from '@web3-onboard/injected-wallets'
import { hasValidPairingSession } from '@/services/pairing/utils'
import { PAIRING_MODULE_LABEL } from '@/services/pairing/module'
import { E2E_WALLET_NAME } from '@/tests/e2e-wallet'
import type { EthersError } from '@/utils/ethers-utils'
import { ErrorCode } from '@ethersproject/logger'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { getWeb3ReadOnly } from '@/hooks/wallets/web3'
import { EMPTY_DATA } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import { WALLET_KEYS } from '@/hooks/wallets/consts'

const isWCRejection = (err: Error): boolean => {
  return /rejected/.test(err?.message)
}

const isEthersRejection = (err: EthersError): boolean => {
  return err.code === ErrorCode.ACTION_REJECTED
}

export const isWalletRejection = (err: EthersError | Error): boolean => {
  return isEthersRejection(err as EthersError) || isWCRejection(err)
}

export const WalletNames = {
  METAMASK: ProviderLabel.MetaMask,
  WALLET_CONNECT: 'WalletConnect',
  SAFE_MOBILE_PAIRING: PAIRING_MODULE_LABEL,
}

/* Check if the wallet is unlocked. */
export const isWalletUnlocked = async (walletName: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false

  if (window.ethereum?.isConnected?.()) {
    return true
  }

  // Only MetaMask exposes a method to check if the wallet is unlocked
  if (walletName === WalletNames.METAMASK) {
    return window.ethereum?._metamask?.isUnlocked?.() || false
  }

  // Wallet connect creates a localStorage entry when connected and removes it when disconnected
  if (walletName === WalletNames.WALLET_CONNECT) {
    return window.localStorage.getItem('walletconnect') !== null
  }

  // Our own Safe mobile pairing module
  if (walletName === WalletNames.SAFE_MOBILE_PAIRING && hasValidPairingSession()) {
    return hasValidPairingSession()
  }

  if (walletName === E2E_WALLET_NAME) {
    return Boolean(window.Cypress)
  }

  return false
}

export const isHardwareWallet = (wallet: ConnectedWallet): boolean => {
  return [WALLET_KEYS.LEDGER, WALLET_KEYS.TREZOR, WALLET_KEYS.KEYSTONE].includes(
    wallet.label.toUpperCase() as WALLET_KEYS,
  )
}

export const isSmartContractWallet = async (wallet: ConnectedWallet) => {
  const provider = getWeb3ReadOnly()

  if (!provider) {
    throw new Error('Provider not found')
  }

  const code = await provider.getCode(wallet.address)

  return code !== EMPTY_DATA
}
