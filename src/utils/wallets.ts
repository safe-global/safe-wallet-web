import type { EthersError } from '@/utils/ethers-utils'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { getWeb3ReadOnly, isSmartContract } from '@/hooks/wallets/web3'
import { WALLET_KEYS } from '@/hooks/wallets/consts'
import memoize from 'lodash/memoize'
import { PRIVATE_KEY_MODULE_LABEL } from '@/services/private-key-module'

const WALLETCONNECT = 'WalletConnect'

const isWCRejection = (err: Error): boolean => {
  return /rejected/.test(err?.message)
}

const isEthersRejection = (err: EthersError): boolean => {
  return err.code === 'ACTION_REJECTED'
}

export const isWalletRejection = (err: EthersError | Error): boolean => {
  return isEthersRejection(err as EthersError) || isWCRejection(err)
}

export const isLedger = (wallet: ConnectedWallet): boolean => {
  return wallet.label.toUpperCase() === WALLET_KEYS.LEDGER
}

export const isWalletConnect = (wallet: ConnectedWallet): boolean => {
  return wallet.label.toLowerCase().startsWith(WALLETCONNECT.toLowerCase())
}

export const isHardwareWallet = (wallet: ConnectedWallet): boolean => {
  return [WALLET_KEYS.LEDGER, WALLET_KEYS.TREZOR, WALLET_KEYS.KEYSTONE].includes(
    wallet.label.toUpperCase() as WALLET_KEYS,
  )
}

export const isSmartContractWallet = memoize(
  async (_chainId: string, address: string) => {
    const provider = getWeb3ReadOnly()

    if (!provider) {
      throw new Error('Provider not found')
    }

    return isSmartContract(provider, address)
  },
  (chainId, address) => chainId + address,
)

/* Check if the wallet is unlocked. */
export const isWalletUnlocked = async (walletName: string): Promise<boolean | undefined> => {
  if (walletName === PRIVATE_KEY_MODULE_LABEL) return true

  const METAMASK_LIKE = ['MetaMask', 'Rabby Wallet', 'Zerion']

  // Only MetaMask exposes a method to check if the wallet is unlocked
  if (METAMASK_LIKE.includes(walletName)) {
    if (typeof window === 'undefined' || !window.ethereum?._metamask) return false
    try {
      return await window.ethereum?._metamask.isUnlocked()
    } catch {
      return false
    }
  }

  return false
}
