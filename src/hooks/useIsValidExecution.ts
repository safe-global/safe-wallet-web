import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { BigNumber } from 'ethers'
import type { EthersError } from '@/utils/ethers-utils'

import useAsync from './useAsync'
import ContractErrorCodes from '@/services/contracts/ContractErrorCodes'
import { type SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { getAndValidateSafeSDK } from '@/services/tx/tx-sender/sdk'
import useSafeInfo from '@/hooks/useSafeInfo'
import { createWeb3, useWeb3ReadOnly } from '@/hooks/wallets/web3'
import EthersAdapter from '@safe-global/safe-ethers-lib'
import { ethers } from 'ethers'
import useWallet from '@/hooks/wallets/useWallet'
import { type JsonRpcProvider } from '@ethersproject/providers'
import { type ConnectedWallet } from '@/services/onboard'

const isContractError = (error: EthersError) => {
  if (!error.reason) return false

  return Object.keys(ContractErrorCodes).includes(error.reason)
}

// Monkey patch the signerProvider to proxy requests to the "readonly" provider if on the wrong chain
const getPatchedSignerProvider = (
  wallet: ConnectedWallet,
  chainId: SafeInfo['chainId'],
  readOnlyProvider: JsonRpcProvider,
) => {
  const signerProvider = createWeb3(wallet.provider)

  if (wallet.chainId !== chainId) {
    const signerMethods = ['eth_accounts']
    const originalSend = signerProvider.send

    signerProvider.send = (request, ...args) => {
      if (!signerMethods.includes(request)) {
        return readOnlyProvider.send.call(readOnlyProvider, request, ...args)
      }
      return originalSend.call(signerProvider, request, ...args)
    }
  }

  return signerProvider
}

const useIsValidExecution = (
  safeTx?: SafeTransaction,
  gasLimit?: BigNumber,
): {
  isValidExecution?: boolean
  executionValidationError?: Error
  isValidExecutionLoading: boolean
} => {
  const wallet = useWallet()
  const { safe } = useSafeInfo()
  const readOnlyProvider = useWeb3ReadOnly()

  const [isValidExecution, executionValidationError, isValidExecutionLoading] = useAsync(async () => {
    if (!safeTx || !wallet || !gasLimit || !readOnlyProvider) {
      return
    }
    try {
      /**
       * We need to provide a signer address for isValidTransaction but
       * don't actually need to sign anything, so we get a patched instance
       * of the provider where the wallet network of the signer doesn't matter
       */
      const patchedSignerProvider = getPatchedSignerProvider(wallet, safe.chainId, readOnlyProvider)

      const sdk = getAndValidateSafeSDK()
      const ethAdapter = new EthersAdapter({
        ethers,
        signerOrProvider: patchedSignerProvider,
      })

      const safeSdk = await sdk.connect({ ethAdapter })
      return await safeSdk.isValidTransaction(safeTx, { gasLimit: gasLimit.toString(), from: wallet.address })
    } catch (_err) {
      const err = _err as EthersError

      if (isContractError(err)) {
        // @ts-ignore
        err.reason += `: ${ContractErrorCodes[err.reason]}`
      }

      throw err
    }
  }, [safeTx, wallet, gasLimit, safe.chainId, readOnlyProvider])

  return { isValidExecution, executionValidationError, isValidExecutionLoading }
}

export default useIsValidExecution
