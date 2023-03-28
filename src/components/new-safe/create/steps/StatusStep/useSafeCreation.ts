import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { useWeb3, useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { useCurrentChain } from '@/hooks/useChains'
import useWallet from '@/hooks/wallets/useWallet'
import type { EthersError } from '@/utils/ethers-utils'
import type { PendingSafeData } from '@/components/new-safe/create/steps/StatusStep/index'
import type { PendingSafeTx } from '@/components/new-safe/create/types'
import {
  createNewSafe,
  getSafeDeployProps,
  checkSafeCreationTx,
  getSafeCreationTxInfo,
  handleSafeCreationError,
  SAFE_CREATION_ERROR_KEY,
  showSafeCreationError,
} from '@/components/new-safe/create/logic'
import { useAppDispatch } from '@/store'
import { closeByGroupKey, showNotification } from '@/store/notificationsSlice'
import { CREATE_SAFE_EVENTS, trackEvent } from '@/services/analytics'
import {
  getFallbackHandlerContractInstance,
  getGnosisSafeContractInstance,
  getProxyFactoryContractInstance,
} from '@/services/contracts/safeContracts'
import { sponsoredCall } from '@/services/tx/sponsoredCall'
import { EMPTY_DATA, ZERO_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import { Gnosis_safe__factory } from '@/types/contracts/factories/@gnosis.pm/safe-deployments/dist/assets/v1.3.0'
import { waitForRelayedTx } from '@/services/tx/txMonitor'

export enum SafeCreationStatus {
  AWAITING,
  PROCESSING,
  WALLET_REJECTED,
  ERROR,
  REVERTED,
  TIMEOUT,
  SUCCESS,
  INDEXED,
  INDEX_FAILED,
}

export const useSafeCreation = (
  pendingSafe: PendingSafeData | undefined,
  setPendingSafe: Dispatch<SetStateAction<PendingSafeData | undefined>>,
  status: SafeCreationStatus,
  setStatus: Dispatch<SetStateAction<SafeCreationStatus>>,
  willRelay?: boolean,
) => {
  const [isCreating, setIsCreating] = useState(false)
  const [isWatching, setIsWatching] = useState(false)
  const dispatch = useAppDispatch()

  const wallet = useWallet()
  const provider = useWeb3()
  const web3ReadOnly = useWeb3ReadOnly()
  const chain = useCurrentChain()

  const createSafeCallback = useCallback(
    async (txHash: string, tx: PendingSafeTx) => {
      setStatus(SafeCreationStatus.PROCESSING)
      trackEvent(CREATE_SAFE_EVENTS.SUBMIT_CREATE_SAFE)
      setPendingSafe((prev) => (prev ? { ...prev, txHash, tx } : undefined))
    },
    [setStatus, setPendingSafe],
  )

  const createSafe = useCallback(async () => {
    if (!pendingSafe || !provider || !chain || !wallet || isCreating) return

    setIsCreating(true)
    dispatch(closeByGroupKey({ groupKey: SAFE_CREATION_ERROR_KEY }))

    if (willRelay) {
      const proxyFactory = getProxyFactoryContractInstance(chain.chainId)
      const proxyFactoryAddress = proxyFactory.getAddress()
      const fallbackHandlerDeployment = getFallbackHandlerContractInstance(chain.chainId)

      const callData = {
        owners: pendingSafe.owners.map((owner) => owner.address),
        threshold: pendingSafe.threshold,
        to: ZERO_ADDRESS,
        data: EMPTY_DATA,
        fallbackHandlerAddress: fallbackHandlerDeployment.getAddress(),
        paymentToken: ZERO_ADDRESS,
        payment: 0,
        paymentReceiver: ZERO_ADDRESS,
      }

      try {
        const initializer = Gnosis_safe__factory.createInterface().encodeFunctionData('setup', [
          callData.owners,
          callData.threshold,
          callData.to,
          callData.data,
          callData.fallbackHandlerAddress,
          callData.paymentToken,
          callData.payment,
          callData.paymentReceiver,
        ])

        const safeContract = getGnosisSafeContractInstance(chain)

        const createProxyWithNonceCallData = proxyFactory.contract.interface.encodeFunctionData(
          'createProxyWithNonce',
          [safeContract.getAddress(), initializer, pendingSafe.saltNonce],
        )

        const relayResponse = await sponsoredCall({
          chainId: chain.chainId,
          to: proxyFactoryAddress,
          data: createProxyWithNonceCallData,
        })
        const taskId = relayResponse.taskId

        if (!taskId) {
          throw new Error('Transaction could not be relayed')
        }

        setPendingSafe((prev) => (prev ? { ...prev, taskId } : undefined))
        setStatus(SafeCreationStatus.PROCESSING)
        waitForRelayedTx(taskId, undefined, setStatus)
      } catch (error) {
        setStatus(SafeCreationStatus.ERROR)
        dispatch(
          showNotification({
            message: `Your transaction was unsuccessful. Reason: ${(error as Error).message}`,
            detailedMessage: (error as Error).message,
            groupKey: SAFE_CREATION_ERROR_KEY,
            variant: 'error',
          }),
        )
      }
    } else if (!willRelay) {
      try {
        const tx = await getSafeCreationTxInfo(provider, pendingSafe, chain, wallet)

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
        setStatus(SafeCreationStatus.SUCCESS)
      } catch (err) {
        const _err = err as EthersError
        const status = handleSafeCreationError(_err)

        setStatus(status)

        if (status !== SafeCreationStatus.SUCCESS) {
          dispatch(showSafeCreationError(_err))
        }
      }
    }

    setIsCreating(false)
  }, [
    chain,
    createSafeCallback,
    dispatch,
    isCreating,
    pendingSafe,
    provider,
    setPendingSafe,
    setStatus,
    wallet,
    willRelay,
  ])

  const watchSafeTx = useCallback(async () => {
    if (!pendingSafe?.tx || !pendingSafe?.txHash || !web3ReadOnly || isWatching) return

    setStatus(SafeCreationStatus.PROCESSING)
    setIsWatching(true)

    const txStatus = await checkSafeCreationTx(web3ReadOnly, pendingSafe.tx, pendingSafe.txHash, dispatch)
    setStatus(txStatus)
    setIsWatching(false)
  }, [isWatching, pendingSafe, web3ReadOnly, setStatus, dispatch])

  useEffect(() => {
    if (status !== SafeCreationStatus.AWAITING) return

    if (pendingSafe?.txHash && !isCreating) {
      void watchSafeTx()
      return
    }

    if (pendingSafe?.taskId && !isCreating) {
      waitForRelayedTx(pendingSafe?.taskId, undefined, setStatus)
      return
    }

    void createSafe()
  }, [createSafe, watchSafeTx, isCreating, pendingSafe?.txHash, status, pendingSafe?.taskId, setStatus])

  return {
    createSafe,
  }
}
