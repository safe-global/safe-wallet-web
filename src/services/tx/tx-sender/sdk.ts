import { getSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import type Safe from '@safe-global/safe-core-sdk'
import EthersAdapter from '@safe-global/safe-ethers-lib'
import { ethers } from 'ethers'
import type { Web3Provider } from '@ethersproject/providers'
import semverSatisfies from 'semver/functions/satisfies'
import { shouldUseEthSignMethod } from '@/hooks/wallets/wallets'
import { isWalletRejection } from '@/utils/wallets'
import type { ConnectedWallet } from '@/services/onboard'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

export const getAndValidateSafeSDK = (): Safe => {
  const safeSDK = getSafeSDK()
  if (!safeSDK) {
    throw new Error('The Safe SDK could not be initialized. Please be aware that we only support v1.1.1 Safes and up.')
  }
  return safeSDK
}

/**
 * https://docs.ethers.io/v5/api/providers/jsonrpc-provider/#UncheckedJsonRpcSigner
 * This resolves the promise sooner when executing a tx and mocks
 * most of the values of transactionResponse which is needed when
 * dealing with smart-contract wallet owners
 */
export const getUncheckedSafeSDK = (provider: Web3Provider): Promise<Safe> => {
  const sdk = getAndValidateSafeSDK()

  const signer = provider.getSigner()
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer.connectUnchecked(),
  })

  return sdk.connect({ ethAdapter })
}

type SigningMethods = Parameters<Safe['signTransaction']>[1]

export const _getSupportedSigningMethods = (
  safeVersion: SafeInfo['version'],
  wallet: ConnectedWallet,
): SigningMethods[] => {
  const SAFE_VERSION_SUPPORTS_ETH_SIGN = '>=1.1.0'

  if (!safeVersion || !semverSatisfies(safeVersion, SAFE_VERSION_SUPPORTS_ETH_SIGN)) {
    return ['eth_signTypedData_v4']
  }

  if (shouldUseEthSignMethod(wallet)) {
    return ['eth_sign']
  }

  // Hardware wallet may be connected via MetaMask so we try `eth_sign` after EIP-712
  return ['eth_signTypedData_v4', 'eth_sign']
}

export const tryOffChainSigning = async ({
  safeTx,
  safeVersion,
  wallet,
  txId,
}: {
  safeTx: SafeTransaction
  safeVersion: SafeInfo['version']
  wallet: ConnectedWallet
  txId?: string
}): Promise<SafeTransaction | undefined> => {
  const sdk = getAndValidateSafeSDK()

  let signedTx: SafeTransaction | undefined

  for (const signingMethod of _getSupportedSigningMethods(safeVersion, wallet)) {
    try {
      signedTx = await sdk.signTransaction(safeTx, signingMethod)

      break
    } catch (_error) {
      const error = _error as Error

      // Try next signing method if the user did not reject the transaction
      if (!isWalletRejection(error)) {
        continue
      }

      throw error
    }
  }

  return signedTx
}
