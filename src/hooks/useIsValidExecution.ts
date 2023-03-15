import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { BigNumber } from 'ethers'
import type { EthersError } from '@/utils/ethers-utils'

import useAsync from './useAsync'
import ContractErrorCodes from '@/services/contracts/ContractErrorCodes'
import { type SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { createWeb3, useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { type JsonRpcProvider } from '@ethersproject/providers'
import { type ConnectedWallet } from '@/services/onboard'
import { getSpecificGnosisSafeContractInstance } from '@/services/contracts/safeContracts'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { encodeSignatures } from '@/services/tx/encodeSignatures'

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
    const readOnlyMethods = ['eth_getCode', 'eth_call']
    const originalSend = signerProvider.send

    signerProvider.send = (request, ...args) => {
      if (readOnlyMethods.includes(request)) {
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
      const provider = getPatchedSignerProvider(wallet, safe.chainId, readOnlyProvider)
      const { contract } = getSpecificGnosisSafeContractInstance(safe, provider)

      /**
       * We need to call the contract directly instead of using sdk.isValidTransaction
       * because gasLimit errors are not propagated otherwise. It also fixes the over-fetching
       * issue that the monkey patched provider does
       */
      return contract.callStatic.execTransaction(
        safeTx.data.to,
        safeTx.data.value,
        safeTx.data.data,
        safeTx.data.operation,
        safeTx.data.safeTxGas,
        safeTx.data.baseGas,
        safeTx.data.gasPrice,
        safeTx.data.gasToken,
        safeTx.data.refundReceiver,
        encodeSignatures(safeTx, wallet.address),
        { from: wallet.address, gasLimit: gasLimit.toString() },
      )
    } catch (_err) {
      const err = _err as EthersError

      if (isContractError(err)) {
        // @ts-ignore
        err.reason += `: ${ContractErrorCodes[err.reason]}`
      }

      throw err
    }
  }, [safeTx, wallet, gasLimit, safe, readOnlyProvider])

  return { isValidExecution, executionValidationError, isValidExecutionLoading }
}

export default useIsValidExecution
