import type { TempAPI } from '@/components/safe-apps/types'
import { getSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import type { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { connectWallet, getConnectedWallet, getOnboardStore } from '@/hooks/wallets/useOnboard'
import { createWeb3 } from '@/hooks/wallets/web3'
import { asError } from '@/services/exceptions/utils'
import { UncheckedJsonRpcSigner } from '@/utils/providers/UncheckedJsonRpcSigner'
import { hasSafeFeature } from '@/utils/safe-versions'
import { isHardwareWallet, isWalletRejection } from '@/utils/wallets'
import { chains } from '@particle-network/chains'
import type Safe from '@safe-global/protocol-kit'
import { EthersAdapter, SigningMethod } from '@safe-global/protocol-kit'
import { SAFE_FEATURES } from '@safe-global/protocol-kit/dist/src/utils/safeVersions'
import { OperationType, type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

import type { JsonRpcSigner } from 'ethers'
import { ethers } from 'ethers'

export const getAndValidateSafeSDK = (): Safe => {
  const safeSDK = getSafeSDK()
  if (!safeSDK) {
    throw new Error(
      'The Safe SDK could not be initialized. Please be aware that we only support v1.0.0 Safe Accounts and up.',
    )
  }
  return safeSDK
}

export const switchWalletChain = async (onboard: TempAPI, chainId: string): Promise<ConnectedWallet | null> => {
  const currentWallet = getConnectedWallet(getOnboardStore?.()?.state.get().wallets)

  if (!currentWallet) {
    return null
  }

  try {
    if (isHardwareWallet(currentWallet)) {
      await onboard.disconnectWallet({ label: currentWallet.label })
      const wallets = await connectWallet(onboard, { autoSelect: currentWallet.label })

      return wallets ? getConnectedWallet(wallets) : null
    }

    const targetChain = chains.getEVMChainInfoById(Number(chainId))
    await currentWallet.switchChain(targetChain)

    /**
     * Onboard doesn't update immediately and otherwise returns a stale wallet if we directly get its state
     */
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getConnectedWallet(getOnboardStore?.()?.state.get().wallets))
      }, 100)
    })
  } catch (error) {
    return currentWallet
  }
}

export const assertWalletChain = async (onboard: TempAPI, chainId: string): Promise<ConnectedWallet> => {
  const wallet = getConnectedWallet(getOnboardStore?.()?.state.get().wallets)

  if (!wallet) {
    throw new Error('No wallet connected.')
  }

  if (wallet.chainId === chainId) {
    return wallet
  }

  const newWallet = await switchWalletChain(onboard, chainId)

  if (!newWallet) {
    throw new Error('No wallet connected.')
  }

  if (newWallet.chainId !== chainId) {
    throw new Error('Wallet connected to wrong chain.')
  }

  return newWallet
}

export const getAssertedChainSigner = async (
  onboard: TempAPI,
  chainId: SafeInfo['chainId'],
): Promise<JsonRpcSigner> => {
  const wallet = await assertWalletChain(onboard, chainId)
  const provider = createWeb3(wallet.provider)
  return provider.getSigner()
}

/**
 * https://docs.ethers.io/v5/api/providers/jsonrpc-provider/#UncheckedJsonRpcSigner
 * This resolves the promise sooner when executing a tx and mocks
 * most of the values of transactionResponse which is needed when
 * dealing with smart-contract wallet owners
 */
export const getUncheckedSafeSDK = async (onboard: TempAPI, chainId: SafeInfo['chainId']): Promise<Safe> => {
  const signer = await getAssertedChainSigner(onboard, chainId)
  const uncheckedJsonRpcSigner = new UncheckedJsonRpcSigner(signer.provider, await signer.getAddress())
  const sdk = getAndValidateSafeSDK()

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: uncheckedJsonRpcSigner,
  })

  return sdk.connect({ ethAdapter })
}

export const getSafeSDKWithSigner = async (onboard: TempAPI, chainId: SafeInfo['chainId']): Promise<Safe> => {
  const signer = await getAssertedChainSigner(onboard, chainId)
  const sdk = getAndValidateSafeSDK()

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  })

  return sdk.connect({ ethAdapter })
}

export const getSupportedSigningMethods = (safeVersion: SafeInfo['version']): SigningMethod[] => {
  if (!hasSafeFeature(SAFE_FEATURES.ETH_SIGN, safeVersion)) {
    return [SigningMethod.ETH_SIGN_TYPED_DATA]
  }

  return [SigningMethod.ETH_SIGN_TYPED_DATA, SigningMethod.ETH_SIGN]
}

export const tryOffChainTxSigning = async (
  safeTx: SafeTransaction,
  safeVersion: SafeInfo['version'],
  sdk: Safe,
): Promise<SafeTransaction> => {
  const signingMethods = getSupportedSigningMethods(safeVersion)

  for await (const [i, signingMethod] of signingMethods.entries()) {
    try {
      return await sdk.signTransaction(safeTx, signingMethod)
    } catch (error) {
      const isLastSigningMethod = i === signingMethods.length - 1

      if (isWalletRejection(asError(error)) || isLastSigningMethod) {
        throw error
      }
    }
  }

  // Won't be reached, but TS otherwise complains
  throw new Error('No supported signing methods')
}

export const isDelegateCall = (safeTx: SafeTransaction): boolean => {
  return safeTx.data.operation === OperationType.DelegateCall
}
