import { createContext } from 'react'

import { useSimulation, type UseSimulationReturn } from '@/components/tx/TxSimulation/useSimulation'
import { FETCH_STATUS } from '@/components/tx/TxSimulation/types'

export const TxInfoContext = createContext<{
  simulation: UseSimulationReturn
}>({
  simulation: {
    simulateTransaction: () => {},
    simulation: undefined,
    simulationRequestStatus: FETCH_STATUS.NOT_ASKED,
    simulationLink: '',
    requestError: undefined,
    resetSimulation: () => {},
  },
})

export const TxInfoProvider = ({ children }: { children: JSX.Element }) => {
  const simulation = useSimulation()

  return <TxInfoContext.Provider value={{ simulation }}>{children}</TxInfoContext.Provider>
}
