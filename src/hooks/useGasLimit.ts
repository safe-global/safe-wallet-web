import { useMemo } from 'react'
import type { BigNumber } from 'ethers'
import type Safe from '@gnosis.pm/safe-core-sdk'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { OperationType } from '@gnosis.pm/safe-core-sdk-types'
import useAsync from '@/hooks/useAsync'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import useSafeAddress from './useSafeAddress'
import useWallet from './wallets/useWallet'
import { useSafeSDK } from './coreSDK/safeCoreSDK'

export const getPreValidatedSignature = (from: string): string => {
  return `0x000000000000000000000000${from
    .toLowerCase()
    .replace('0x', '')}000000000000000000000000000000000000000000000000000000000000000001`
}

export const _encodeSignatures = (safeTx: SafeTransaction, from: string): string => {
  const owner = from.toLowerCase()
  const needsOwnerSig = !safeTx.signatures.has(owner)

  // https://docs.gnosis.io/safe/docs/contracts_signatures/#pre-validated-signatures
  if (needsOwnerSig) {
    const ownerSig = getPreValidatedSignature(from)

    safeTx.addSignature({
      signer: owner,
      data: ownerSig,
      staticPart: () => ownerSig,
      dynamicPart: () => '',
    })
  }

  const encoded = safeTx.encodedSignatures()

  // Remove the "fake" signature we added
  if (needsOwnerSig) {
    safeTx.signatures.delete(owner)
  }

  return encoded
}

const estimateSafeTxGas = (safeSDK: Safe, safeTx: SafeTransaction, from: string): string => {
  const EXEC_TX_METHOD = 'execTransaction'

  return safeSDK
    .getContractManager()
    .safeContract.encode(EXEC_TX_METHOD, [
      safeTx.data.to,
      safeTx.data.value,
      safeTx.data.data,
      safeTx.data.operation,
      safeTx.data.safeTxGas,
      0,
      safeTx.data.gasPrice,
      safeTx.data.gasToken,
      safeTx.data.refundReceiver,
      _encodeSignatures(safeTx, from),
    ])
}

const useGasLimit = (
  safeTx?: SafeTransaction,
): {
  gasLimit?: BigNumber
  gasLimitError?: Error
  gasLimitLoading: boolean
} => {
  const safeSDK = useSafeSDK()
  const web3ReadOnly = useWeb3ReadOnly()
  const safeAddress = useSafeAddress()
  const wallet = useWallet()
  const walletAddress = wallet?.address

  const encodedSafeTx = useMemo<string>(() => {
    if (!safeTx || !safeSDK || !walletAddress) {
      return ''
    }
    return estimateSafeTxGas(safeSDK, safeTx, walletAddress)
  }, [safeSDK, safeTx, walletAddress])

  const operationType = useMemo<number>(
    () => (safeTx?.data.operation == OperationType.DelegateCall ? 1 : 0),
    [safeTx?.data.operation],
  )

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync(() => {
    if (!safeAddress || !walletAddress || !encodedSafeTx || !web3ReadOnly) return

    return web3ReadOnly.estimateGas({
      to: safeAddress,
      from: walletAddress,
      data: encodedSafeTx,
      type: operationType,
    })
  }, [safeAddress, walletAddress, encodedSafeTx, web3ReadOnly, operationType])

  return { gasLimit, gasLimitError, gasLimitLoading }
}

export default useGasLimit
