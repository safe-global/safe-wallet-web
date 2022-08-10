import { PendingSafeData } from '@/components/create-safe'
import { createNewSafe } from '@/components/create-safe/sender'
import { usePendingSafeCreation } from '@/components/create-safe/status/usePendingSafeCreation'
import { usePendingSafe } from '@/components/create-safe/usePendingSafe'
import { useWeb3 } from '@/hooks/wallets/web3'
import Safe, { DeploySafeProps } from '@gnosis.pm/safe-core-sdk'
import { useCallback, useEffect, useState } from 'react'
import { PredictSafeProps } from '@gnosis.pm/safe-core-sdk/dist/src/safeFactory'
import useWallet from '@/hooks/wallets/useWallet'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import useCreatePromise from '@/components/create-safe/status/hooks/useCreatePromise'
import useStatusListener from '@/components/create-safe/status/hooks/useStatusListener'
import useResolvePromise from '@/components/create-safe/status/hooks/useResolvePromise'

export enum SafeCreationStatus {
  AWAITING = 'AWAITING',
  AWAITING_WALLET = 'AWAITING_WALLET',
  MINING = 'MINING',
  ERROR = 'ERROR',
  REVERTED = 'REVERTED',
  TIMEOUT = 'TIMEOUT',
  SUCCESS = 'SUCCESS',
  INDEXED = 'INDEXED',
  INDEX_FAILED = 'INDEX_FAILED',
}

export const getSafeDeployProps = (
  pendingSafe: PendingSafeData,
  callback: (txHash: string) => void,
): PredictSafeProps & { callback: DeploySafeProps['callback'] } => {
  return {
    safeAccountConfig: {
      threshold: pendingSafe.threshold,
      owners: pendingSafe.owners.map((owner) => owner.address),
    },
    safeDeploymentConfig: {
      saltNonce: pendingSafe.saltNonce.toString(),
    },
    callback,
  }
}

export const useSafeCreation = () => {
  const [status, setStatus] = useState<SafeCreationStatus>(SafeCreationStatus.AWAITING_WALLET)
  const [safeAddress, setSafeAddress] = useState<string>()
  const [creationPromise, setCreationPromise] = useState<Promise<Safe>>()
  const [pendingSafe, setPendingSafe] = usePendingSafe()
  const provider = useWeb3()
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()

  const safeCreationCallback = useCallback(
    (txHash: string) => {
      setStatus(SafeCreationStatus.MINING)
      setPendingSafe((prev) => prev && { ...prev, txHash })
    },
    [setPendingSafe],
  )

  usePendingSafeCreation({ txHash: pendingSafe?.txHash, setSafeAddress, setStatus })
  useCreatePromise({ status, creationPromise, pendingSafe, safeCreationCallback, setCreationPromise, setStatus })
  useResolvePromise({ creationPromise, setStatus, pendingSafe })
  useStatusListener({ status, safeAddress, pendingSafe, setPendingSafe, setCreationPromise, setStatus })

  const onRetry = () => {
    if (!provider || !pendingSafe) return

    setStatus(SafeCreationStatus.AWAITING)
    setCreationPromise(createNewSafe(provider, getSafeDeployProps(pendingSafe, safeCreationCallback)))
  }

  useEffect(() => {
    const newStatus = !wallet || isWrongChain ? SafeCreationStatus.AWAITING_WALLET : SafeCreationStatus.AWAITING
    setStatus(newStatus)
  }, [wallet, isWrongChain])

  useEffect(() => {
    if (!pendingSafe) return

    setSafeAddress(pendingSafe.safeAddress)
  }, [pendingSafe])

  return {
    safeAddress,
    status,
    onRetry,
    txHash: pendingSafe?.txHash,
  }
}
