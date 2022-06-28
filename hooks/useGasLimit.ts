import { useMemo } from 'react'
import { BigNumber } from 'ethers'
import Safe from '@gnosis.pm/safe-core-sdk'
import useAsync from '@/hooks/useAsync'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import useSafeAddress from './useSafeAddress'
import useWallet from './wallets/useWallet'
import { getSafeSDK } from './coreSDK/safeCoreSDK'

const estimateSafeTxGas = (safeSDK: Safe, safeTx: SafeTransaction): string => {
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
      safeTx.encodedSignatures(),
    ])
}

const useGasLimit = (
  safeTx?: SafeTransaction,
): {
  gasLimit?: BigNumber
  gasLimitError?: Error
  gasLimitLoading: boolean
} => {
  const safeSDK = getSafeSDK()
  const web3ReadOnly = useWeb3ReadOnly()
  const safeAddress = useSafeAddress()
  const wallet = useWallet()
  const walletAddress = wallet?.address

  const encodedSafeTx = useMemo<string>(() => {
    return safeTx && safeSDK ? estimateSafeTxGas(safeSDK, safeTx) : ''
  }, [safeSDK, safeTx])

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
