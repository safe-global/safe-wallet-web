import { JsonRpcProvider } from '@ethersproject/providers'
import { backOff } from 'exponential-backoff'
import { didRevert } from '@/utils/ethers-utils'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'
import { useEffect } from 'react'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getSafeInfo, SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'

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

export const checkSafeCreationTx = async (provider: JsonRpcProvider, txHash: string) => {
  const TIMEOUT_TIME = 6.5

  try {
    const receipt = await provider.waitForTransaction(txHash, 1, TIMEOUT_TIME * 60_000)

    if (didRevert(receipt)) {
      return SafeCreationStatus.REVERTED
    }

    return SafeCreationStatus.SUCCESS
  } catch (error) {
    return SafeCreationStatus.TIMEOUT
  }
}

type Props = {
  txHash: string | undefined
  setStatus: (status: SafeCreationStatus) => void
}

export const usePendingSafeCreation = ({ txHash, setStatus }: Props) => {
  const provider = useWeb3ReadOnly()

  useEffect(() => {
    if (!txHash || !provider) return

    const monitorTx = async (txHash: string) => {
      const txStatus = await checkSafeCreationTx(provider, txHash)
      setStatus(txStatus)
    }

    setStatus(SafeCreationStatus.MINING)
    monitorTx(txHash)
  }, [txHash, provider, setStatus])
}
