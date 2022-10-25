import type { JsonRpcProvider } from '@ethersproject/providers'
import { backOff } from 'exponential-backoff'
import type { EthersError } from '@/utils/ethers-utils'
import { didRevert } from '@/utils/ethers-utils'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'
import { useEffect } from 'react'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import type { SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { getSafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { ErrorCode } from '@ethersproject/logger'
import { Errors, logError } from '@/services/exceptions'
import type { PendingSafeData, PendingSafeTx } from '@/components/create-safe'

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

export const checkSafeCreationTx = async (
  provider: JsonRpcProvider,
  pendingTx: PendingSafeTx,
  txHash: string,
): Promise<SafeCreationStatus> => {
  const TIMEOUT_TIME = 6.5 * 60 * 1000 // 6.5 minutes

  try {
    const receipt = await provider._waitForTransaction(txHash, 1, TIMEOUT_TIME, pendingTx)

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
  pendingSafe?: PendingSafeData
  status: SafeCreationStatus
  setStatus: (status: SafeCreationStatus) => void
}

export const usePendingSafeCreation = ({ pendingSafe, status, setStatus }: Props) => {
  const provider = useWeb3ReadOnly()

  useEffect(() => {
    if (
      !provider ||
      !pendingSafe?.txHash ||
      status === SafeCreationStatus.PROCESSING ||
      status === SafeCreationStatus.ERROR ||
      status === SafeCreationStatus.REVERTED ||
      status === SafeCreationStatus.TIMEOUT ||
      status === SafeCreationStatus.SUCCESS
    ) {
      return
    }

    const monitorTx = async () => {
      if (!pendingSafe.tx || !pendingSafe.txHash) return

      const txStatus = await checkSafeCreationTx(provider, pendingSafe.tx, pendingSafe.txHash)
      setStatus(txStatus)
    }

    setStatus(SafeCreationStatus.PROCESSING)
    monitorTx()
  }, [pendingSafe, provider, status, setStatus])
}
