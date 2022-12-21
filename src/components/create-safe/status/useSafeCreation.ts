import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useState } from 'react'
import {
  createNewSafe,
  getSafeCreationTxInfo,
  getSafeDeployProps,
  checkSafeCreationTx,
  handleSafeCreationError,
} from '@/components/create-safe/logic'
import { useWeb3, useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { useCurrentChain } from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
import type { PendingSafeData, PendingSafeTx } from '@/components/create-safe/types.d'
import type { EthersError } from '@/utils/ethers-utils'
import { CREATE_SAFE_EVENTS, trackEvent } from '@/services/analytics'

export enum SafeCreationStatus {
  AWAITING = 'AWAITING',
  PROCESSING = 'PROCESSING',
  WALLET_REJECTED = 'WALLET_REJECTED',
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
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [isWatching, setIsWatching] = useState<boolean>(false)

  const wallet = useWallet()
  const provider = useWeb3()
  const web3ReadOnly = useWeb3ReadOnly()
  const chain = useCurrentChain()

  const createSafeCallback = useCallback(
    async (txHash: string, tx: PendingSafeTx) => {
      trackEvent(CREATE_SAFE_EVENTS.SUBMIT_CREATE_SAFE)
      setPendingSafe((prev) => (prev ? { ...prev, txHash, tx } : undefined))
    },
    [setPendingSafe],
  )

  const createSafe = useCallback(async () => {
    if (!pendingSafe || !provider || !chain || !wallet || isCreating) return

    setIsCreating(true)

    try {
      const tx = await getSafeCreationTxInfo(provider, pendingSafe, chain, pendingSafe.saltNonce, wallet)

      const safeParams = getSafeDeployProps(
        {
          threshold: pendingSafe.threshold,
          owners: pendingSafe.owners.map((owner) => owner.address),
          saltNonce: pendingSafe.saltNonce,
        },
        (txHash) => createSafeCallback(txHash, tx),
        chain.chainId,
      )

      await createNewSafe(provider, safeParams)
    } catch (err) {
      setStatus(handleSafeCreationError(err as EthersError))
    }

    setIsCreating(false)
  }, [chain, createSafeCallback, isCreating, pendingSafe, provider, setStatus, wallet])

  const watchSafeTx = useCallback(async () => {
    if (!pendingSafe?.tx || !pendingSafe?.txHash || !web3ReadOnly || isWatching) return

    setStatus(SafeCreationStatus.PROCESSING)
    setIsWatching(true)

    const txStatus = await checkSafeCreationTx(web3ReadOnly, pendingSafe.tx, pendingSafe.txHash)
    setStatus(txStatus)
    setIsWatching(false)
  }, [isWatching, pendingSafe, web3ReadOnly, setStatus])

  useEffect(() => {
    if (status !== SafeCreationStatus.AWAITING) return

    if (pendingSafe?.txHash) {
      void watchSafeTx()
      return
    }

    void createSafe()
  }, [createSafe, watchSafeTx, pendingSafe?.txHash, status])

  return {
    createSafe,
    txHash: pendingSafe?.txHash,
  }
}
