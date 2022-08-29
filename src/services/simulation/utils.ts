import axios from 'axios'
import { FEATURES, type ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import type { TenderlySimulatePayload, TenderlySimulation } from '@/services/simulation/types'
import { hasFeature } from '@/utils/chains'
import { TENDERLY_SIMULATE_ENDPOINT_URL, TENDERLY_ORG_NAME, TENDERLY_PROJECT_NAME } from '@/config/constants'

export const getSimulation = async (tx: TenderlySimulatePayload): Promise<TenderlySimulation> => {
  const { data } = await axios.post<TenderlySimulation>(TENDERLY_SIMULATE_ENDPOINT_URL, tx)

  return data
}

export const isTxSimulationEnabled = (chain: ChainInfo): boolean => {
  const isSimulationEnvSet =
    Boolean(TENDERLY_SIMULATE_ENDPOINT_URL) && Boolean(TENDERLY_ORG_NAME) && Boolean(TENDERLY_PROJECT_NAME)

  return isSimulationEnvSet && hasFeature(chain, FEATURES.TX_SIMULATION)
}

export const getSimulationLink = (simulationId: string): string => {
  return `https://dashboard.tenderly.co/public/${TENDERLY_ORG_NAME}/${TENDERLY_PROJECT_NAME}/simulator/${simulationId}`
}
