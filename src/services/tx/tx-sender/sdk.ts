import { getSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import type Safe from '@safe-global/safe-core-sdk'
import EthersAdapter from '@safe-global/safe-ethers-lib'
import { ethers } from 'ethers'
import { isWalletRejection } from '@/utils/wallets'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { SAFE_FEATURES } from '@safe-global/safe-core-sdk-utils'
import { hasSafeFeature } from '@/utils/safe-versions'
import { createWeb3 } from '@/hooks/wallets/web3'
import { hexValue } from 'ethers/lib/utils'
import { connectWallet, getConnectedWallet } from '@/hooks/wallets/useOnboard'
import { isHardwareWallet } from '@/hooks/wallets/wallets'
import { type OnboardAPI } from '@web3-onboard/core'
import { type ConnectedWallet } from '@/services/onboard'

export const getAndValidateSafeSDK = (): Safe => {
  const safeSDK = getSafeSDK()
  if (!safeSDK) {
    throw new Error('The Safe SDK could not be initialized. Please be aware that we only support v1.0.0 Safes and up.')
  }
  return safeSDK
}

export const switchWalletChain = async (onboard: OnboardAPI, chainId: string) => {
  const chainIdInHex = hexValue(parseInt(chainId))

  const wallet = getConnectedWallet(onboard.state.get().wallets)

  if (wallet && isHardwareWallet(wallet)) {
    await onboard.disconnectWallet({ label: wallet.label })
    await connectWallet(onboard, { autoSelect: wallet.label })
  } else {
    await onboard.setChain({ chainId: chainIdInHex })
  }

  /**
   * Onboard doesn't update immediately and returns a wallet that's on the
   * previous chain, so we add a slight timeout before accessing its state again
   */
  return new Promise<ConnectedWallet>((resolve) => {
    setTimeout(() => {
      const newWallet = getConnectedWallet(onboard.state.get().wallets)

      if (!newWallet) throw new Error('No wallet connected')

      return resolve(newWallet)
    }, 500)
  })
}

/**
 * https://docs.ethers.io/v5/api/providers/jsonrpc-provider/#UncheckedJsonRpcSigner
 * This resolves the promise sooner when executing a tx and mocks
 * most of the values of transactionResponse which is needed when
 * dealing with smart-contract wallet owners
 */
export const getUncheckedSafeSDK = async (onboard: OnboardAPI, chainId: SafeInfo['chainId']): Promise<Safe> => {
  const wallet = await switchWalletChain(onboard, chainId)
  const sdk = getAndValidateSafeSDK()

  const provider = createWeb3(wallet.provider)
  const signer = provider.getSigner()
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer.connectUnchecked(),
  })

  return sdk.connect({ ethAdapter })
}

export const getSafeSDKWithSigner = async (onboard: OnboardAPI, chainId: SafeInfo['chainId']): Promise<Safe> => {
  const wallet = await switchWalletChain(onboard, chainId)
  const sdk = getAndValidateSafeSDK()

  const provider = createWeb3(wallet.provider)
  const signer = provider.getSigner()
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  })

  return sdk.connect({ ethAdapter })
}

type SigningMethods = Parameters<Safe['signTransaction']>[1]

export const _getSupportedSigningMethods = (safeVersion: SafeInfo['version']): SigningMethods[] => {
  const ETH_SIGN_TYPED_DATA: SigningMethods = 'eth_signTypedData'
  const ETH_SIGN: SigningMethods = 'eth_sign'

  if (!hasSafeFeature(SAFE_FEATURES.ETH_SIGN, safeVersion)) {
    return [ETH_SIGN_TYPED_DATA]
  }

  return [ETH_SIGN_TYPED_DATA, ETH_SIGN]
}

export const tryOffChainSigning = async (
  safeTx: SafeTransaction,
  safeVersion: SafeInfo['version'],
  sdk: Safe,
): Promise<SafeTransaction> => {
  const signingMethods = _getSupportedSigningMethods(safeVersion)

  for await (const [i, signingMethod] of signingMethods.entries()) {
    try {
      return await sdk.signTransaction(safeTx, signingMethod)
    } catch (error) {
      const isLastSigningMethod = i === signingMethods.length - 1

      if (isWalletRejection(error as Error) || isLastSigningMethod) {
        throw error
      }
    }
  }

  // Won't be reached, but TS otherwise complains
  throw new Error('No supported signing methods')
}
