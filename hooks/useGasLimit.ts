import { useMemo } from 'react'
import { BigNumber } from 'ethers'
import Safe from '@gnosis.pm/safe-core-sdk'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import useAsync from '@/hooks/useAsync'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import useSafeAddress from './useSafeAddress'
import useWallet from './wallets/useWallet'
import { useSafeSDK } from './coreSDK/safeCoreSDK'
import { EMPTY_DATA, ZERO_ADDRESS } from '@gnosis.pm/safe-core-sdk/dist/src/utils/constants'
import useChainId from '@/hooks/useChainId'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import {
  getFallbackHandlerContractInstance,
  getGnosisSafeContractInstance,
  getProxyFactoryContractInstance,
} from '@/services/safeContracts'

const getPreValidatedSignature = (from: string): string => {
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

export const useEstimateSafeCreationGas = (
  owners: string[],
  threshold: number,
  safeCreationSalt: number,
): {
  gasLimit?: BigNumber
  gasLimitError?: Error
  gasLimitLoading: boolean
} => {
  const web3ReadOnly = useWeb3ReadOnly()
  const chainId = useChainId()
  const chainInfo = useAppSelector((state) => selectChainById(state, chainId))
  const wallet = useWallet()

  const safeContract = getGnosisSafeContractInstance(chainInfo!)
  const proxyContract = getProxyFactoryContractInstance(chainId)
  const fallbackHandlerContract = getFallbackHandlerContractInstance(chainId)

  const setupData = safeContract.interface.encodeFunctionData('setup', [
    owners,
    threshold,
    ZERO_ADDRESS,
    EMPTY_DATA,
    fallbackHandlerContract.address,
    ZERO_ADDRESS,
    '0',
    ZERO_ADDRESS,
  ])

  const encodedSafeCreationTx = proxyContract.interface.encodeFunctionData('createProxyWithNonce', [
    safeContract.address,
    setupData,
    safeCreationSalt,
  ])

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<BigNumber | undefined>(async () => {
    if (!wallet?.address || !encodedSafeCreationTx || !web3ReadOnly) return undefined

    return await web3ReadOnly.estimateGas({
      to: proxyContract.address,
      from: wallet.address,
      data: encodedSafeCreationTx,
    })
  }, [proxyContract.address, wallet, encodedSafeCreationTx, web3ReadOnly])

  return { gasLimit, gasLimitError, gasLimitLoading }
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

  const [gasLimit, gasLimitError, gasLimitLoading] = useAsync<BigNumber | undefined>(async () => {
    if (!safeAddress || !walletAddress || !encodedSafeTx || !web3ReadOnly) return undefined

    return await web3ReadOnly.estimateGas({
      to: safeAddress,
      from: walletAddress,
      data: encodedSafeTx,
    })
  }, [safeAddress, walletAddress, encodedSafeTx, web3ReadOnly])

  return { gasLimit, gasLimitError, gasLimitLoading }
}

export default useGasLimit
