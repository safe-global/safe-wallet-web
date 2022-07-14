import { useCallback, useEffect, useState } from 'react'
import Safe from '@gnosis.pm/safe-core-sdk'
import { useWeb3 } from '@/hooks/wallets/web3'
import { useRouter } from 'next/router'
import { PendingSafeData } from '@/components/create-safe'
import { AppRoutes } from '@/config/routes'
import { Errors, logError } from '@/services/exceptions'
import { usePendingSafe } from '@/components/create-safe/usePendingSafe'
import { createNewSafe } from '@/components/create-safe/sender'
import { usePendingSafeCreation } from '@/components/create-safe/status/usePendingSafeCreation'

export enum SafeCreationStatus {
  PENDING = 'PENDING',
  MINING = 'MINING',
  ERROR = 'ERROR',
  REVERTED = 'REVERTED',
  TIMEOUT = 'TIMEOUT',
  SUCCESS = 'SUCCESS',
}

const getSafeDeployProps = (pendingSafe: PendingSafeData, callback: (txHash: string) => void) => {
  return {
    safeAccountConfig: {
      threshold: pendingSafe.threshold,
      owners: pendingSafe.owners.map((owner) => owner.address),
    },
    safeDeploymentConfig: {
      saltNonce: pendingSafe.saltNonce,
    },
    callback,
  }
}

export const useSafeCreation = () => {
  const [status, setStatus] = useState<SafeCreationStatus>(SafeCreationStatus.PENDING)
  const [safeAddress, setSafeAddress] = useState<string>()
  const [creationPromise, setCreationPromise] = useState<Promise<Safe>>()
  const [pendingSafe, setPendingSafe] = usePendingSafe()
  const ethersProvider = useWeb3()
  const router = useRouter()

  usePendingSafeCreation({ txHash: pendingSafe?.txHash, setSafeAddress, setStatus })

  const safeCreationCallback = useCallback(
    (txHash: string) => {
      setStatus(SafeCreationStatus.MINING)
      setPendingSafe((prev) => prev && { ...prev, txHash })
    },
    [setPendingSafe],
  )

  const onRetry = () => {
    if (!ethersProvider || !pendingSafe) return

    setStatus(SafeCreationStatus.PENDING)
    setCreationPromise(createNewSafe(ethersProvider, getSafeDeployProps(pendingSafe, safeCreationCallback)))
  }

  useEffect(() => {
    if (
      creationPromise ||
      pendingSafe?.txHash ||
      !ethersProvider ||
      !pendingSafe ||
      status === SafeCreationStatus.ERROR
    ) {
      return
    }

    setStatus(SafeCreationStatus.PENDING)
    setCreationPromise(createNewSafe(ethersProvider, getSafeDeployProps(pendingSafe, safeCreationCallback)))
  }, [safeCreationCallback, creationPromise, ethersProvider, pendingSafe, status])

  useEffect(() => {
    if (!creationPromise || !pendingSafe) return

    creationPromise
      .then((safe) => {
        setStatus(SafeCreationStatus.SUCCESS)
        setSafeAddress(safe.getAddress())
      })
      .catch((error: Error) => {
        setStatus(SafeCreationStatus.ERROR)
        logError(Errors._800, error.message)
      })
  }, [creationPromise, pendingSafe, router, setPendingSafe])

  useEffect(() => {
    if (status === SafeCreationStatus.SUCCESS) {
      setPendingSafe(undefined)
      safeAddress && router.push({ pathname: AppRoutes.safe.home, query: { safe: safeAddress, new: 1 } })
    }

    if (status === SafeCreationStatus.ERROR || status === SafeCreationStatus.REVERTED) {
      setCreationPromise(undefined)
      setPendingSafe((prev) => prev && { ...prev, txHash: undefined })
    }
  }, [status, safeAddress, setPendingSafe, router])

  return {
    status,
    onRetry,
    txHash: pendingSafe?.txHash,
  }
}
