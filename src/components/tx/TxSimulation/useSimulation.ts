import { useCallback, useMemo, useState } from 'react'

import { getSimulation, getSimulationLink } from '@/components/tx/TxSimulation/utils'
import { FETCH_STATUS, type TenderlySimulation } from '@/components/tx/TxSimulation/types'
import { getSimulationPayload, type SimulationTxParams } from '@/components/tx/TxSimulation/utils'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'

type UseSimulationReturn =
  | {
      simulationRequestStatus: FETCH_STATUS.NOT_ASKED | FETCH_STATUS.ERROR | FETCH_STATUS.LOADING
      simulation: undefined
      simulateTransaction: (params: Omit<SimulationTxParams, 'gasLimit'>) => void
      simulationLink: string
      requestError?: string
      resetSimulation: () => void
    }
  | {
      simulationRequestStatus: FETCH_STATUS.SUCCESS
      simulation: TenderlySimulation
      simulateTransaction: (params: Omit<SimulationTxParams, 'gasLimit'>) => void
      simulationLink: string
      requestError?: string
      resetSimulation: () => void
    }

export const useSimulation = (): UseSimulationReturn => {
  const [simulation, setSimulation] = useState<TenderlySimulation | undefined>()
  const [simulationRequestStatus, setSimulationRequestStatus] = useState<FETCH_STATUS>(FETCH_STATUS.NOT_ASKED)
  const [requestError, setRequestError] = useState<string | undefined>(undefined)
  const web3ReadOnly = useWeb3ReadOnly()

  const simulationLink = useMemo(() => getSimulationLink(simulation?.simulation.id || ''), [simulation])

  const resetSimulation = useCallback(() => {
    setSimulationRequestStatus(FETCH_STATUS.NOT_ASKED)
    setRequestError(undefined)
    setSimulation(undefined)
  }, [])

  const simulateTransaction = useCallback(
    async (params: Omit<SimulationTxParams, 'gasLimit'>) => {
      if (!web3ReadOnly) return

      setSimulationRequestStatus(FETCH_STATUS.LOADING)
      setRequestError(undefined)

      try {
        const { gasLimit } = await web3ReadOnly.getBlock('latest')
        const simulationPayload = getSimulationPayload({
          ...params,
          gasLimit: gasLimit.toNumber(),
        } as SimulationTxParams)

        const data = await getSimulation(simulationPayload)

        setSimulation(data)
        setSimulationRequestStatus(FETCH_STATUS.SUCCESS)
      } catch (error) {
        console.error(error)

        setRequestError((error as Error).message)
        setSimulationRequestStatus(FETCH_STATUS.ERROR)
      }
    },
    [web3ReadOnly],
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
