import type { PendingSafeData } from '@/components/create-safe'
import { createNewSafe } from '@/components/create-safe/sender'
import { usePendingSafeCreation } from '@/components/create-safe/status/usePendingSafeCreation'
import { usePendingSafe } from '@/components/create-safe/usePendingSafe'
import { useWeb3 } from '@/hooks/wallets/web3'
import type { DeploySafeProps } from '@gnosis.pm/safe-core-sdk'
import { useCallback, useEffect, useState } from 'react'
import type { PredictSafeProps } from '@gnosis.pm/safe-core-sdk/dist/src/safeFactory'
import useWallet from '@/hooks/wallets/useWallet'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import useWatchSafeCreation from '@/components/create-safe/status/hooks/useWatchSafeCreation'
import type { AppThunk } from '@/store'
import { useAppDispatch } from '@/store'
import { Errors, logError } from '@/services/exceptions'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { addOrUpdateSafe } from '@/store/addedSafesSlice'
import { defaultSafeInfo } from '@/store/safeInfoSlice'
import useChainId from '@/hooks/useChainId'
import { trackEvent, CREATE_SAFE_EVENTS } from '@/services/analytics'
import { isWalletRejection } from '@/utils/wallets'
import { getFallbackHandlerContractInstance } from '@/services/contracts/safeContracts'

export enum SafeCreationStatus {
  AWAITING = 'AWAITING',
  AWAITING_WALLET = 'AWAITING_WALLET',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR',
  REVERTED = 'REVERTED',
  TIMEOUT = 'TIMEOUT',
  SUCCESS = 'SUCCESS',
  INDEXED = 'INDEXED',
  INDEX_FAILED = 'INDEX_FAILED',
}

export const addSafeAndOwnersToAddressBook = (pendingSafe: PendingSafeData, chainId: string): AppThunk => {
  return (dispatch) => {
    dispatch(
      upsertAddressBookEntry({
        chainId: chainId,
        address: pendingSafe.address,
        name: pendingSafe.name,
      }),
    )

    pendingSafe.owners.forEach((owner) => {
      const entryName = owner.name || owner.ens
      if (entryName) {
        dispatch(upsertAddressBookEntry({ chainId, address: owner.address, name: entryName }))
      }
    })

    dispatch(
      addOrUpdateSafe({
        safe: {
          ...defaultSafeInfo,
          address: { value: pendingSafe.address, name: pendingSafe.name },
          threshold: pendingSafe.threshold,
          owners: pendingSafe.owners.map((owner) => ({
            value: owner.address,
            name: owner.name || owner.ens,
          })),
          chainId: chainId,
          nonce: 0,
        },
      }),
    )
  }
}

export const getSafeDeployProps = (
  pendingSafe: PendingSafeData,
  callback: (txHash: string) => void,
  chainId: string,
): PredictSafeProps & { callback: DeploySafeProps['callback'] } => {
  const fallbackHandler = getFallbackHandlerContractInstance(chainId)

  return {
    safeAccountConfig: {
      threshold: pendingSafe.threshold,
      owners: pendingSafe.owners.map((owner) => owner.address),
      fallbackHandler: fallbackHandler.address,
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
  const [isCreationPending, setIsCreationPending] = useState<boolean>(false)
  const [pendingSafe, setPendingSafe] = usePendingSafe()
  const provider = useWeb3()
  const chainId = useChainId()
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()
  const dispatch = useAppDispatch()

  const safeCreationCallback = useCallback(
    (txHash: string) => {
      trackEvent(CREATE_SAFE_EVENTS.SUBMIT_CREATE_SAFE)

      setStatus(SafeCreationStatus.PROCESSING)
      setPendingSafe((prev) => (prev ? { ...prev, txHash } : undefined))
    },
    [setPendingSafe],
  )

  const createSafe = useCallback(async () => {
    if (!provider || !pendingSafe || isCreationPending) return

    setStatus(SafeCreationStatus.AWAITING)
    setIsCreationPending(true)

    try {
      await createNewSafe(provider, getSafeDeployProps(pendingSafe, safeCreationCallback, chainId))
      setStatus(SafeCreationStatus.SUCCESS)
      dispatch(addSafeAndOwnersToAddressBook(pendingSafe, chainId))
    } catch (err) {
      const _err = err as Error & { code?: number }

      setStatus(SafeCreationStatus.ERROR)

      if (isWalletRejection(_err)) {
        trackEvent(CREATE_SAFE_EVENTS.REJECT_CREATE_SAFE)
      }

      logError(Errors._800, _err.message)
    }

    setIsCreationPending(false)
  }, [chainId, dispatch, isCreationPending, pendingSafe, provider, safeCreationCallback])

  usePendingSafeCreation({ status, pendingSafe, setStatus })
  useWatchSafeCreation({ status, safeAddress, pendingSafe, setPendingSafe, setStatus, chainId })

  useEffect(() => {
    if (
      pendingSafe?.txHash ||
      status === SafeCreationStatus.ERROR ||
      status === SafeCreationStatus.REVERTED ||
      status === SafeCreationStatus.SUCCESS ||
      status === SafeCreationStatus.INDEXED ||
      status === SafeCreationStatus.INDEX_FAILED
    ) {
      return
    }

    const newStatus = !wallet || isWrongChain ? SafeCreationStatus.AWAITING_WALLET : SafeCreationStatus.AWAITING
    setStatus(newStatus)
  }, [wallet, isWrongChain, pendingSafe?.txHash, status])

  useEffect(() => {
    if (!pendingSafe) return

    setSafeAddress(pendingSafe.address)
  }, [pendingSafe])

  useEffect(() => {
    if (status === SafeCreationStatus.AWAITING && !pendingSafe?.txHash) {
      createSafe()
    }
  }, [status, createSafe, pendingSafe?.txHash])

  return {
    safeAddress,
    status,
    createSafe,
    txHash: pendingSafe?.txHash,
  }
}
