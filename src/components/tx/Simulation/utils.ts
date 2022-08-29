import { TENDERLY_SIMULATE_ENDPOINT_URL, TENDERLY_ORG_NAME, TENDERLY_PROJECT_NAME } from '@/config/constants'
import type { TenderlySimulatePayload, TenderlySimulation } from '@/components/tx/Simulation/types'

export const getSimulation = async (tx: TenderlySimulatePayload): Promise<TenderlySimulation> => {
  const data = await fetch(TENDERLY_SIMULATE_ENDPOINT_URL, {
    method: 'POST',
    body: JSON.stringify(tx),
  }).then((res) => res.json())

  return data as TenderlySimulation
}

export const getSimulationLink = (simulationId: string): string => {
  return `https://dashboard.tenderly.co/public/${TENDERLY_ORG_NAME}/${TENDERLY_PROJECT_NAME}/simulator/${simulationId}`
}
