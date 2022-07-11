import { useCallback, useEffect, useState } from 'react'
import Safe from '@gnosis.pm/safe-core-sdk'
import { useWeb3 } from '@/hooks/wallets/web3'
import { useRouter } from 'next/router'
import { PendingSafeData } from '@/components/create-safe'
import { AppRoutes } from '@/config/routes'
import { Errors, logError } from '@/services/exceptions'
import { usePendingSafe } from '@/components/create-safe/usePendingSafe'
import { createNewSafe } from '@/components/create-safe/sender'

export enum SafeCreationStatus {
  PENDING = 'PENDING',
  ERROR = 'ERROR',
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
  const [creationPromise, setCreationPromise] = useState<Promise<Safe>>()
  const [pendingSafe, setPendingSafe] = usePendingSafe()
  const ethersProvider = useWeb3()
  const router = useRouter()

  const safeCreationCallback = useCallback(
    (txHash: string) => {
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
    if (pendingSafe?.txHash) {
      setStatus(SafeCreationStatus.PENDING)
      // TODO: monitor existing tx
    }
  }, [pendingSafe])

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
        setPendingSafe(undefined)
        router.push({ pathname: AppRoutes.safe.home, query: { safe: safe.getAddress(), new: 1 } })
      })
      .catch((error: Error) => {
        setStatus(SafeCreationStatus.ERROR)
        setCreationPromise(undefined)
        setPendingSafe((prev) => prev && { ...prev, txHash: undefined })
        logError(Errors._800, error.message)
        return
      })
  }, [creationPromise, pendingSafe, router, setPendingSafe])

  return {
    status,
    onRetry,
  }
}
