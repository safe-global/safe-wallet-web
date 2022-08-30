import { useCallback, useMemo, useState } from 'react'
import type { BaseTransaction } from '@gnosis.pm/safe-apps-sdk'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

import { TENDERLY_SIMULATE_ENDPOINT_URL } from '@/config/constants'
import { getSimulationLink, getSimulationTx, isTxSimulationEnabled } from '@/components/tx/TxSimulation/utils'
import { FETCH_STATUS, type TenderlySimulatePayload, type TenderlySimulation } from '@/components/tx/TxSimulation/types'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { useWeb3 } from '@/hooks/wallets/web3'
import { isSafeVersion } from '@/hooks/coreSDK/safeCoreSDK'

type UseSimulationReturn =
  | {
      simulationRequestStatus: FETCH_STATUS.NOT_ASKED | FETCH_STATUS.ERROR | FETCH_STATUS.LOADING
      simulation: undefined
      simulateTransaction: (
        tx: Omit<BaseTransaction, 'value'>,
        chainId: string,
        safeAddress: string,
        walletAddress: string,
        canExecute: boolean,
        gasLimit: number,
      ) => void
      simulationLink: string
      requestError?: string
      resetSimulation: () => void
    }
  | {
      simulationRequestStatus: FETCH_STATUS.SUCCESS
      simulation: TenderlySimulation
      simulateTransaction: (
        tx: Omit<BaseTransaction, 'value'>,
        chainId: string,
        safeAddress: string,
        walletAddress: string,
        canExecute: boolean,
        gasLimit: number,
      ) => void
      simulationLink: string
      requestError?: string
      resetSimulation: () => void
    }

export const useSimulation = (): UseSimulationReturn => {
  const [simulation, setSimulation] = useState<TenderlySimulation | undefined>()
  const [simulationRequestStatus, setSimulationRequestStatus] = useState<FETCH_STATUS>(FETCH_STATUS.NOT_ASKED)
  const [requestError, setRequestError] = useState<string | undefined>(undefined)

  const simulationLink = useMemo(() => getSimulationLink(simulation?.simulation.id || ''), [simulation])

  const resetSimulation = useCallback(() => {
    setSimulationRequestStatus(FETCH_STATUS.NOT_ASKED)
    setRequestError(undefined)
    setSimulation(undefined)
  }, [])

  const simulateTransaction = useCallback(
    async (
      tx: Omit<BaseTransaction, 'value'>,
      chainId: string,
      safeAddress: string,
      walletAddress: string,
      canExecute: boolean,
      gasLimit: number,
    ) => {
      setSimulationRequestStatus(FETCH_STATUS.LOADING)
      setRequestError(undefined)

      const simulationPayload: TenderlySimulatePayload = {
        network_id: chainId,
        from: walletAddress,
        to: tx.to,
        input: tx.data,
        gas: gasLimit,
        gas_price: '0',
        state_objects: {
          [safeAddress]: {
            balance: undefined,
            code: undefined,
            /**
             * If the tx can not be executed (i.e. because signatures are missing)
             * we overwrite the threshold of the contract with 1 such that the tx can be executed with only 1 signature.
             * Otherwise the simulation would always fail when checking the owner signatures.
             */
            storage: canExecute
              ? undefined
              : {
                  [`0x${'4'.padStart(64, '0')}`]: `0x${'1'.padStart(64, '0')}`,
                },
          },
        },
        save: true,
        save_if_fails: true,
      }

      try {
        const data = (await fetch(TENDERLY_SIMULATE_ENDPOINT_URL, {
          method: 'POST',
          body: JSON.stringify(simulationPayload),
        }).then((res) => res.json())) as TenderlySimulation

        setSimulation(data)
        setSimulationRequestStatus(FETCH_STATUS.SUCCESS)
      } catch (error) {
        console.error(error)

        setRequestError((error as Error).message)
        setSimulationRequestStatus(FETCH_STATUS.ERROR)
      }
    },
    [],
  )

  return {
    simulateTransaction,
    simulationRequestStatus,
    simulation,
    simulationLink,
    requestError,
    resetSimulation,
  } as UseSimulationReturn
}

export const useSimulationTx = ({
  safeTx,
  canExecute,
  isEstimating,
}: {
  safeTx?: SafeTransaction
  canExecute: boolean
  isEstimating: boolean
}) => {
  const chain = useCurrentChain()
  const provider = useWeb3()
  const wallet = useWallet()
  const { safeAddress, safe } = useSafeInfo()

  return useMemo(() => {
    if (
      !provider ||
      !wallet?.address ||
      !isSafeVersion(safe.version) ||
      !isTxSimulationEnabled(chain) ||
      isEstimating ||
      !safeTx
    ) {
      return ''
    }

    return getSimulationTx({
      provider,
      safeVersion: safe.version,
      safeAddress,
      canExecute,
      ownerAddress: wallet.address,
      safeTx,
    })
  }, [wallet?.address, safe?.version, chain, isEstimating, safeTx, canExecute, safeAddress, provider])
}
