import type { JsonRpcProvider } from '@ethersproject/providers'
import { backOff } from 'exponential-backoff'
import type { EthersError } from '@/utils/ethers-utils'
import { didRevert } from '@/utils/ethers-utils'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'
import { useEffect } from 'react'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import type { SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { getSafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { getProxyFactoryContractInstance } from '@/services/contracts/safeContracts'
import useChainId from '@/hooks/useChainId'
import { ErrorCode } from '@ethersproject/logger'
import { Errors, logError } from '@/services/exceptions'

export const pollSafeInfo = async (chainId: string, safeAddress: string): Promise<SafeInfo> => {
  // exponential delay between attempts for around 4 min
  return backOff(() => getSafeInfo(chainId, safeAddress), {
    startingDelay: 750,
    maxDelay: 20000,
    numOfAttempts: 19,
    retry: (e) => {
      console.info('waiting for client-gateway to provide safe information', e)
      return true
    },
  })
}

export const _getTransactionByHash = (provider: JsonRpcProvider, txHash: string) => {
  return provider.getTransaction(txHash).then((resp) => {
    if (resp === null) {
      throw new Error('Transaction not found')
    }
    return resp
  })
}

const pollTransaction = async (provider: JsonRpcProvider, txHash: string) => {
  return backOff(() => _getTransactionByHash(provider, txHash), {
    startingDelay: 750,
    maxDelay: 10000,
    numOfAttempts: 10,
    retry: (e) => {
      console.info('waiting for transaction', e)
      return true
    },
  })
}

export const checkSafeCreationTx = async (
  provider: JsonRpcProvider,
  txHash: string,
  chainId: string,
): Promise<SafeCreationStatus> => {
  const TIMEOUT_TIME = 6.5 * 60 * 1000 // 6.5 minutes

  try {
    const txResponse = await pollTransaction(provider, txHash)

    const proxyContractAddress = getProxyFactoryContractInstance(chainId).getAddress()

    const replacement = {
      data: txResponse.data,
      from: txResponse.from,
      nonce: txResponse.nonce,
      to: proxyContractAddress,
      value: txResponse.value,
      startBlock: txResponse.blockNumber || (await provider.getBlockNumber()),
    }

    const receipt = await provider._waitForTransaction(txHash, 1, TIMEOUT_TIME, replacement)

    if (didRevert(receipt)) {
      return SafeCreationStatus.REVERTED
    }

    return SafeCreationStatus.SUCCESS
  } catch (err) {
    const error = err as EthersError

    logError(Errors._800, error.message)

    if (error.code === ErrorCode.TRANSACTION_REPLACED) {
      if (error.reason === 'cancelled') {
        return SafeCreationStatus.ERROR
      } else {
        return SafeCreationStatus.SUCCESS
      }
    }

    return SafeCreationStatus.TIMEOUT
  }
}

type Props = {
  txHash: string | undefined
  setStatus: (status: SafeCreationStatus) => void
}

export const usePendingSafeCreation = ({ txHash, setStatus }: Props) => {
  const provider = useWeb3ReadOnly()
  const chainId = useChainId()

  useEffect(() => {
    if (!txHash || !provider) return

    const monitorTx = async () => {
      const txStatus = await checkSafeCreationTx(provider, txHash, chainId)
      setStatus(txStatus)
    }

    setStatus(SafeCreationStatus.PROCESSING)
    monitorTx()
  }, [txHash, provider, setStatus, chainId])
}
