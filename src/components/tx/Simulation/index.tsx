import { AccordionSummary, Accordion, Button, Skeleton, Typography } from '@mui/material'
import { ReactElement } from 'react'
import type { BaseTransaction } from '@gnosis.pm/safe-apps-sdk'

import Track from '@/components/common/Track'
import useAsync from '@/hooks/useAsync'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { getWeb3 } from '@/hooks/wallets/web3'
import { MODALS_EVENTS } from '@/services/analytics'
import { SimulationResult } from '@/components/tx/Simulation/SimulationResult'
import { FETCH_STATUS } from '@/components/tx/Simulation/types'
import { useSimulation } from '@/components/tx/Simulation/useSimulation'
import { isTxSimulationEnabled } from './utils'

type TxSimulationProps = {
  // TODO: May be able to use `SafeTransactionData` from SDK
  tx: Omit<BaseTransaction, 'value'>
  canExecute: boolean
  gasLimit?: string
  disabled: boolean
}

const TxSimulationBlock = ({ tx, canExecute, gasLimit, disabled }: TxSimulationProps): ReactElement => {
  const { simulateTransaction, simulation, simulationRequestStatus, simulationLink, requestError, resetSimulation } =
    useSimulation()
  const { safe } = useSafeInfo()

  const wallet = useWallet()
  const web3 = getWeb3()

  const [blockGasLimit] = useAsync(async () => {
    if (!web3) {
      return
    }
    const latestBlock = await web3.getBlock('latest')
    return latestBlock.gasLimit
  }, [web3])

  const simulationGasLimit = Number(gasLimit) || Number(blockGasLimit) || 0

  const handleSimulation = async () => {
    if (!wallet) {
      return
    }
    simulateTransaction(tx, safe.chainId, safe.address.value, wallet?.address, canExecute, simulationGasLimit)
  }

  const isSimulationFinished =
    simulationRequestStatus === FETCH_STATUS.ERROR || simulationRequestStatus === FETCH_STATUS.SUCCESS
  const isSimulationLoading = simulationRequestStatus === FETCH_STATUS.LOADING || simulationGasLimit === 0
  const showSimulationButton = !isSimulationFinished

  return showSimulationButton ? (
    <Accordion expanded={false}>
      <AccordionSummary>
        <Typography>Transaction validity</Typography>
        <Track {...MODALS_EVENTS.SIMULATE_TX}>
          <Button
            variant="text"
            disabled={disabled || isSimulationLoading}
            color="secondary"
            onClick={handleSimulation}
          >
            {isSimulationLoading && <Skeleton />}
            <span>Simulate</span>
          </Button>
        </Track>
      </AccordionSummary>
    </Accordion>
  ) : (
    <Accordion expanded>
      <AccordionSummary>
        <SimulationResult
          onClose={resetSimulation}
          simulation={simulation}
          simulationRequestStatus={simulationRequestStatus}
          simulationLink={simulationLink}
          requestError={requestError}
        />
      </AccordionSummary>
    </Accordion>
  )
}

export const TxSimulation = (props: TxSimulationProps): ReactElement | null => {
  const chain = useCurrentChain()
  if (!chain || !isTxSimulationEnabled(chain)) {
    return null
  }

  return <TxSimulationBlock {...props} />
}
