import type { EthersError } from '@/utils/ethers-utils'
import { ErrorCode } from '@ethersproject/logger'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { getWeb3ReadOnly, isSmartContract } from '@/hooks/wallets/web3'
import { WALLET_KEYS } from '@/hooks/wallets/consts'
import { memoize } from 'lodash'

const isWCRejection = (err: Error): boolean => {
  return /rejected/.test(err?.message)
}

const isEthersRejection = (err: EthersError): boolean => {
  return err.code === ErrorCode.ACTION_REJECTED
}

export const isWalletRejection = (err: EthersError | Error): boolean => {
  return isEthersRejection(err as EthersError) || isWCRejection(err)
}

export const isLedger = (wallet: ConnectedWallet): boolean => {
  return wallet.label.toUpperCase() === WALLET_KEYS.LEDGER
}

export const isHardwareWallet = (wallet: ConnectedWallet): boolean => {
  return [WALLET_KEYS.LEDGER, WALLET_KEYS.TREZOR, WALLET_KEYS.KEYSTONE].includes(
    wallet.label.toUpperCase() as WALLET_KEYS,
  )
}

export const isSmartContractWallet = memoize(
  async (wallet: ConnectedWallet) => {
    const provider = getWeb3ReadOnly()

    if (!provider) {
      throw new Error('Provider not found')
    }

    return isSmartContract(provider, wallet.address)
  },
  ({ chainId, address }) => chainId + address,
)
