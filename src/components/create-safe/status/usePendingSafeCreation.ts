import { JsonRpcProvider } from '@ethersproject/providers'
import { backOff } from 'exponential-backoff'
import { didRevert } from '@/utils/ethers-utils'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'
import { useEffect } from 'react'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getSafeInfo, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { getProxyFactoryContractInstance } from '@/services/contracts/safeContracts'
import useChainId from '@/hooks/useChainId'
import { ErrorCode } from '@ethersproject/logger'

type EthersError = Error & { code: ErrorCode; reason: string }

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

export const checkSafeCreationTx = async (provider: JsonRpcProvider, txHash: string, chainId: string) => {
  const TIMEOUT_TIME = 6.5

  try {
    const blockNumber = await provider.getBlockNumber()
    const txResponse = await provider.getTransaction(txHash)
    const proxyContractAddress = getProxyFactoryContractInstance(chainId).address

    const replacement = {
      data: txResponse.data,
      from: txResponse.from,
      nonce: txResponse.nonce,
      to: proxyContractAddress,
      value: txResponse.value,
      startBlock: txResponse.blockNumber || blockNumber,
    }

    const receipt = await provider._waitForTransaction(txHash, 1, TIMEOUT_TIME * 60_000, replacement)

    if (didRevert(receipt)) {
      return SafeCreationStatus.REVERTED
    }

    return SafeCreationStatus.SUCCESS
  } catch (err) {
    const error = err as EthersError

    if (error.code === 'TRANSACTION_REPLACED') {
      if (error.reason === 'cancelled') {
        return SafeCreationStatus.ERROR
      } else {
        console.log('speed-up tx found!')
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

    setStatus(SafeCreationStatus.MINING)
    monitorTx()
  }, [txHash, provider, setStatus, chainId])
}
