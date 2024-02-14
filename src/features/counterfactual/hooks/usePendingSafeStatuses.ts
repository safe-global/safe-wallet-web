import { SafeCreationEvent, safeCreationSubscribe } from '@/features/counterfactual/services/safeCreationEvents'
import {
  PendingSafeStatus,
  removeUndeployedSafe,
  selectUndeployedSafe,
  updateUndeployedSafeStatus,
} from '@/features/counterfactual/store/undeployedSafesSlice'
import { checkSafeActionViaRelay, checkSafeActivation } from '@/features/counterfactual/utils'
import { isSmartContract, useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { useAppDispatch, useAppSelector } from '@/store'
import { useEffect, useRef } from 'react'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'

const pendingStatuses: Partial<Record<SafeCreationEvent, PendingSafeStatus | null>> = {
  [SafeCreationEvent.PROCESSING]: PendingSafeStatus.PROCESSING,
  [SafeCreationEvent.RELAYING]: PendingSafeStatus.RELAYING,
  [SafeCreationEvent.SUCCESS]: null,
  [SafeCreationEvent.FAILED]: null,
  [SafeCreationEvent.REVERTED]: null,
}

const usePendingSafeMonitor = (): void => {
  const chainId = useChainId()
  const { safeAddress } = useSafeInfo()
  const undeployedSafe = useAppSelector((state) => selectUndeployedSafe(state, chainId, safeAddress))
  const provider = useWeb3ReadOnly()
  const dispatch = useAppDispatch()

  // Prevent monitoring the same safe more than once
  const monitoredSafes = useRef<{ [safeAddress: string]: boolean }>({})

  // Monitor pending safe creation mining/validating progress
  useEffect(() => {
    if (!provider || !undeployedSafe || undeployedSafe.status.status === PendingSafeStatus.AWAITING_EXECUTION) {
      return
    }

    const monitorPendingSafe = async () => {
      const {
        status: { status, txHash, taskId, startBlock },
      } = undeployedSafe

      const isProcessing = status === PendingSafeStatus.PROCESSING && txHash !== undefined
      const isRelaying = status === PendingSafeStatus.RELAYING && taskId !== undefined
      const isMonitored = monitoredSafes.current[safeAddress]

      if ((!isProcessing && !isRelaying) || isMonitored) return

      monitoredSafes.current[safeAddress] = true

      if (isProcessing) {
        checkSafeActivation(provider, txHash, safeAddress, startBlock)
      }

      if (isRelaying) {
        checkSafeActionViaRelay(taskId, safeAddress)
      }
    }

    monitorPendingSafe()
  }, [dispatch, provider, safeAddress, undeployedSafe])
}

const usePendingSafeStatus = (): void => {
  const dispatch = useAppDispatch()
  const { safe, safeAddress } = useSafeInfo()
  const provider = useWeb3ReadOnly()

  usePendingSafeMonitor()

  // Clear undeployed safe state if already deployed
  useEffect(() => {
    if (!provider || !safeAddress) return

    const checkDeploymentStatus = async () => {
      const isContractDeployed = await isSmartContract(provider, safeAddress)

      if (isContractDeployed) {
        dispatch(removeUndeployedSafe({ chainId: safe.chainId, address: safeAddress }))
      }
    }

    checkDeploymentStatus()
  }, [safe.chainId, dispatch, provider, safeAddress])

  // Subscribe to pending safe statuses
  useEffect(() => {
    const unsubFns = Object.entries(pendingStatuses).map(([event, status]) =>
      safeCreationSubscribe(event as SafeCreationEvent, async (detail) => {
        // Clear the pending status if the tx is no longer pending
        const isSuccess = event === SafeCreationEvent.SUCCESS
        if (isSuccess) {
          dispatch(removeUndeployedSafe({ chainId: safe.chainId, address: safeAddress }))
          return
        }

        const isError = status === null
        if (isError) {
          dispatch(
            updateUndeployedSafeStatus({
              chainId: safe.chainId,
              address: safeAddress,
              status: { status: PendingSafeStatus.AWAITING_EXECUTION },
            }),
          )
          return
        }

        dispatch(
          updateUndeployedSafeStatus({
            chainId: safe.chainId,
            address: safeAddress,
            status: {
              status: status,
              txHash: 'txHash' in detail ? detail.txHash : undefined,
              taskId: 'taskId' in detail ? detail.taskId : undefined,
              startBlock: await provider?.getBlockNumber(),
            },
          }),
        )
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [safe.chainId, dispatch, safeAddress, provider])
}

export default usePendingSafeStatus
