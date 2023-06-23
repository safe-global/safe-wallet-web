import { createContext, useMemo } from 'react'
import { useSimulation, type UseSimulationReturn } from '@/components/tx/TxSimulation/useSimulation'
import { FETCH_STATUS } from '@/components/tx/TxSimulation/types'

export const TxInfoContext = createContext<{
  simulateTransaction: UseSimulationReturn['simulateTransaction']
  simulation: UseSimulationReturn['simulation']
  simulationRequestStatus: UseSimulationReturn['simulationRequestStatus']
  simulationLink: UseSimulationReturn['simulationLink']
  requestError: UseSimulationReturn['requestError']
  resetSimulation: UseSimulationReturn['resetSimulation']
}>({
  simulateTransaction: () => {},
  simulation: undefined,
  simulationRequestStatus: FETCH_STATUS.NOT_ASKED,
  simulationLink: '',
  requestError: undefined,
  resetSimulation: () => {},
})

export const TxInfoProvider = ({ children }: { children: JSX.Element }) => {
  const { simulateTransaction, simulation, simulationRequestStatus, simulationLink, requestError, resetSimulation } =
    useSimulation()

  const providedValue = useMemo(
    () => ({
      simulateTransaction,
      simulation,
      simulationRequestStatus,
      simulationLink,
      requestError,
      resetSimulation,
    }),
    [requestError, resetSimulation, simulateTransaction, simulation, simulationLink, simulationRequestStatus],
  )

  return <TxInfoContext.Provider value={providedValue}>{children}</TxInfoContext.Provider>
}
