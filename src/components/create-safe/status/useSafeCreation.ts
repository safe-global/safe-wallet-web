import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useState } from 'react'
import {
  createNewSafe,
  getSafeCreationTxInfo,
  getSafeDeployProps,
  checkSafeCreationTx,
} from '@/components/create-safe/logic'
import { isWalletRejection } from '@/utils/wallets'
import { Errors, logError } from '@/services/exceptions'
import { useWeb3 } from '@/hooks/wallets/web3'
import useChainId from '@/hooks/useChainId'
import { useCurrentChain } from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
import type { PendingSafeData } from '@/components/create-safe'

export enum SafeCreationStatus {
  AWAITING = 'AWAITING',
  AWAITING_WALLET = 'AWAITING_WALLET',
  WALLET_REJECTED = 'WALLET_REJECTED',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR',
  REVERTED = 'REVERTED',
  TIMEOUT = 'TIMEOUT',
  SUCCESS = 'SUCCESS',
  INDEXED = 'INDEXED',
  INDEX_FAILED = 'INDEX_FAILED',
}

export const useSafeCreation = (
  pendingSafe: PendingSafeData | undefined,
  setPendingSafe: Dispatch<SetStateAction<PendingSafeData | undefined>>,
  status: SafeCreationStatus,
  setStatus: Dispatch<SetStateAction<SafeCreationStatus>>,
) => {
  const [isCreationPending, setIsCreationPending] = useState<boolean>(false)

  const wallet = useWallet()
  const provider = useWeb3()
  const chain = useCurrentChain()
  const chainId = useChainId()

  const createSafeCallback = useCallback(
    async (txHash: string) => {
      if (!provider || !chain || !pendingSafe || !wallet) return

      const tx = await getSafeCreationTxInfo(provider, pendingSafe, chain, pendingSafe.saltNonce, wallet)
      setPendingSafe((prev) => (prev ? { ...prev, txHash, tx } : undefined))
    },
    [provider, chain, pendingSafe, wallet, setPendingSafe],
  )

  const createSafe = useCallback(async () => {
    if (!pendingSafe || !provider || isCreationPending) return

    const safeParams = getSafeDeployProps(
      {
        threshold: pendingSafe.threshold,
        owners: pendingSafe.owners.map((owner) => owner.address),
        saltNonce: pendingSafe.saltNonce,
      },
      createSafeCallback,
      chainId,
    )

    setStatus(SafeCreationStatus.AWAITING)
    // Need this to stop createSafe from being called multiple times in the side effect
    setIsCreationPending(true)

    try {
      await createNewSafe(provider, safeParams)
    } catch (err) {
      const _err = err as Error & { code?: number }

      logError(Errors._800, _err.message)

      // TODO: isWalletRejection is not working because the error is not caught here
      const newStatus = isWalletRejection(_err) ? SafeCreationStatus.WALLET_REJECTED : SafeCreationStatus.ERROR
      setStatus(newStatus)

      // Remove the failed txHash
      setPendingSafe((prev) => (prev ? { ...prev, txHash: undefined, tx: undefined } : undefined))
    }

    setIsCreationPending(false)
  }, [chainId, isCreationPending, pendingSafe, provider, createSafeCallback, setPendingSafe, setStatus])

  // Create tx if txHash doesn't exist
  useEffect(() => {
    if (pendingSafe?.txHash || status !== SafeCreationStatus.AWAITING) return

    createSafe()
  }, [createSafe, pendingSafe?.txHash, status])

  // Launch the monitor if txHash exists
  useEffect(() => {
    if (!provider || !pendingSafe?.tx || !pendingSafe?.txHash) return

    const monitorTx = async () => {
      const txStatus = await checkSafeCreationTx(provider, pendingSafe.tx!, pendingSafe.txHash!)
      setStatus(txStatus)
    }

    setStatus(SafeCreationStatus.PROCESSING)
    monitorTx()
  }, [provider, pendingSafe?.tx, pendingSafe?.txHash, setStatus])

  return {
    createSafe,
    txHash: pendingSafe?.txHash,
  }
}
