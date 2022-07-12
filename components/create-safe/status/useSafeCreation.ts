import { useCallback, useEffect, useState } from 'react'
import Safe from '@gnosis.pm/safe-core-sdk'
import { useWeb3, useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { useRouter } from 'next/router'
import { PendingSafeData } from '@/components/create-safe'
import { AppRoutes } from '@/config/routes'
import { Errors, logError } from '@/services/exceptions'
import { usePendingSafe } from '@/components/create-safe/usePendingSafe'
import { createNewSafe } from '@/components/create-safe/sender'
import { didRevert } from '@/utils/ethers-utils'
import { JsonRpcProvider, Log } from '@ethersproject/providers'
import { getProxyFactoryDeployment } from '@gnosis.pm/safe-deployments'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { Interface } from '@ethersproject/abi'
import { sameAddress } from '@/utils/addresses'

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

export const getNewSafeAddressFromLogs = (logs: Log[]): string => {
  let safeAddress = ''
  const contract = getProxyFactoryDeployment({
    version: LATEST_SAFE_VERSION,
  })

  if (!contract) return safeAddress

  const contractInterface = new Interface(contract.abi)

  try {
    const logDescriptions = logs
      .filter((log) => sameAddress(log.address, contract.defaultAddress))
      .map((log) => contractInterface.parseLog(log))

    const proxyCreationEvent = logDescriptions.find(({ name }) => name === 'ProxyCreation')
    safeAddress = proxyCreationEvent?.args['proxy']

    return safeAddress
  } catch (error) {
    console.log(error)
  }

  return safeAddress
}

export const monitorSafeCreationTx = async (provider: JsonRpcProvider, txHash: string) => {
  const TIMEOUT_TIME = 6.5

  try {
    const receipt = await provider.waitForTransaction(txHash, 1, TIMEOUT_TIME * 60_000)

    if (didRevert(receipt)) {
      return {
        status: SafeCreationStatus.REVERTED,
        safeAddress: undefined,
      }
    }

    const safeAddress = getNewSafeAddressFromLogs(receipt.logs)

    return {
      status: SafeCreationStatus.SUCCESS,
      safeAddress,
    }
  } catch (error) {
    return {
      status: SafeCreationStatus.TIMEOUT,
      safeAddress: undefined,
    }
  }
}

export const useSafeCreation = () => {
  const [status, setStatus] = useState<SafeCreationStatus>(SafeCreationStatus.PENDING)
  const [safeAddress, setSafeAddress] = useState<string>()
  const [creationPromise, setCreationPromise] = useState<Promise<Safe>>()
  const [pendingSafe, setPendingSafe] = usePendingSafe()
  const ethersProvider = useWeb3()
  const provider = useWeb3ReadOnly()
  const router = useRouter()

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
    if (!pendingSafe?.txHash || !provider) return

    const monitorTx = async (txHash: string) => {
      const txStatus = await monitorSafeCreationTx(provider, txHash)
      setStatus(txStatus.status)
      setSafeAddress(txStatus.safeAddress)
    }

    setStatus(SafeCreationStatus.MINING)
    monitorTx(pendingSafe.txHash)
  }, [pendingSafe, provider])

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
