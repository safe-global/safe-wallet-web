import { getSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import type Safe from '@safe-global/safe-core-sdk'
import EthersAdapter from '@safe-global/safe-ethers-lib'
import { ethers } from 'ethers'
import { isWalletRejection } from '@/utils/wallets'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { SAFE_FEATURES } from '@safe-global/safe-core-sdk-utils'
import { hasSafeFeature } from '@/utils/safe-versions'
import { hexValue } from 'ethers/lib/utils'
import type { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { asError } from '@/services/exceptions/utils'

export const getAndValidateSafeSDK = (): Safe => {
  const safeSDK = getSafeSDK()
  if (!safeSDK) {
    throw new Error(
      'The Safe SDK could not be initialized. Please be aware that we only support v1.0.0 Safe Accounts and up.',
    )
  }
  return safeSDK
}

export const switchWalletChain = async (provider: Web3Provider, chainId: string): Promise<Web3Provider> => {
  // see https://docs.privy.io/guide/frontend/embedded/networks#switching-between-networks
  await provider.send('wallet_switchEthereumChain', [{ chainId: hexValue(parseInt(chainId)) }])
  return provider
}

export const assertWalletChain = async (provider: Web3Provider, chainId: string): Promise<Web3Provider> => {
  let currentChainId = await provider.send('eth_chainId', [])

  if (!currentChainId) {
    throw new Error('No wallet connected.')
  }

  if (currentChainId === hexValue(parseInt(chainId))) {
    return provider
  }

  const newProvider = await switchWalletChain(provider, chainId)
  currentChainId = await newProvider.send('eth_chainId', [])

  if (!currentChainId) {
    throw new Error('No wallet connected.')
  }

  if (currentChainId !== hexValue(parseInt(chainId))) {
    throw new Error('Wallet connected to wrong chain.')
  }

  return newProvider
}

export const getAssertedChainSigner = async (
  provider: Web3Provider,
  chainId: SafeInfo['chainId'],
): Promise<JsonRpcSigner> => {
  const web3Provider = await assertWalletChain(provider, chainId)
  return web3Provider.getSigner()
}

/**
 * https://docs.ethers.io/v5/api/providers/jsonrpc-provider/#UncheckedJsonRpcSigner
 * This resolves the promise sooner when executing a tx and mocks
 * most of the values of transactionResponse which is needed when
 * dealing with smart-contract wallet owners
 */
export const getUncheckedSafeSDK = async (provider: Web3Provider, chainId: SafeInfo['chainId']): Promise<Safe> => {
  const signer = await getAssertedChainSigner(provider, chainId)
  const sdk = getAndValidateSafeSDK()

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer.connectUnchecked(),
  })

  return sdk.connect({ ethAdapter })
}

export const getSafeSDKWithSigner = async (provider: Web3Provider, chainId: SafeInfo['chainId']): Promise<Safe> => {
  const signer = await getAssertedChainSigner(provider, chainId)
  const sdk = getAndValidateSafeSDK()

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  })

  return sdk.connect({ ethAdapter })
}

type SigningMethods = Parameters<Safe['signTransaction']>[1]

export const getSupportedSigningMethods = (safeVersion: SafeInfo['version']): SigningMethods[] => {
  const ETH_SIGN_TYPED_DATA: SigningMethods = 'eth_signTypedData'
  const ETH_SIGN: SigningMethods = 'eth_sign'

  if (!hasSafeFeature(SAFE_FEATURES.ETH_SIGN, safeVersion)) {
    return [ETH_SIGN_TYPED_DATA]
  }

  return [ETH_SIGN_TYPED_DATA, ETH_SIGN]
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
