import useChainId from '@/hooks/useChainId'
import useOwnedSafes from '@/hooks/useOwnedSafes'
import useSafeInfo from '@/hooks/useSafeInfo'
import useTxQueue from '@/hooks/useTxQueue'
import useWallet from '@/hooks/wallets/useWallet'
import { Errors, logError } from '@/services/exceptions'
import { useAppSelector } from '@/store'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import { sameAddress } from '@/utils/addresses'
import type { PendingActionsByChain } from '@/utils/queuedTxsActions'
import { addPendingActionsByChain } from '@/utils/queuedTxsActions'
import { getTransactionQueue } from '@safe-global/safe-gateway-typescript-sdk'
import { useEffect, useRef, useState } from 'react'

const usePendingActions = () => {
  const addedSafes = useAppSelector(selectAllAddedSafes)
  const ownedSafes = useOwnedSafes()
  const wallet = useWallet()
  const currentChainId = useChainId()
  const { safeAddress: currentSafeAddress } = useSafeInfo()
  const { page } = useTxQueue()
  const [safeTxsActions, setSafeTxsActions] = useState<PendingActionsByChain>()
  const isLoading = useRef(false)

  useEffect(() => {
    if (safeTxsActions || isLoading.current) return

    const getPendingActionsByChain = async () => {
      isLoading.current = true

      let pendingActionsByChain: PendingActionsByChain = {}

      // Added Safes across all chains
      for (const [chainId, safes] of Object.entries(addedSafes)) {
        const ownedSafesOnChain = ownedSafes[chainId] ?? []

        // Added Safes per chain
        for (const safeAddress of Object.keys(safes)) {
          const isOwned = ownedSafesOnChain.includes(safeAddress)
          const isCurrentSafe = currentChainId === chainId && sameAddress(currentSafeAddress, safeAddress)

          try {
            const txListPage = isCurrentSafe && page ? page : await getTransactionQueue(chainId, safeAddress)

            pendingActionsByChain = addPendingActionsByChain(
              chainId,
              safeAddress,
              txListPage,
              isOwned,
              pendingActionsByChain,
              wallet?.address,
            )
          } catch (error) {
            logError(Errors._603)
          }
        }
      }

      isLoading.current = false

      setSafeTxsActions(pendingActionsByChain)
    }

    getPendingActionsByChain()
  }, [addedSafes, currentChainId, currentSafeAddress, ownedSafes, page, wallet?.address, safeTxsActions])

  useEffect(() => {
    isLoading.current = false
    setSafeTxsActions(undefined)
  }, [wallet?.address])

  return safeTxsActions
}

export default usePendingActions
