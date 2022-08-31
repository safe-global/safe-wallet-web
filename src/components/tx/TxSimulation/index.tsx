import { AccordionSummary, Accordion, Button, Typography, CircularProgress } from '@mui/material'
import { ReactElement } from 'react'

import Track from '@/components/common/Track'
import useAsync from '@/hooks/useAsync'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { getWeb3 } from '@/hooks/wallets/web3'
import { MODALS_EVENTS } from '@/services/analytics'
import { SimulationResult } from '@/components/tx/TxSimulation/SimulationResult'
import { FETCH_STATUS } from '@/components/tx/TxSimulation/types'
import { useSimulation } from '@/components/tx/TxSimulation/useSimulation'
import { isTxSimulationEnabled } from '@/components/tx/TxSimulation/utils'
import type { SimulationTxParams } from '@/components/tx/TxSimulation/utils'

import css from './styles.module.css'

export type TxSimulationProps = {
  transactions: SimulationTxParams['transactions']
  canExecute: boolean
  gasLimit?: string
  disabled: boolean
}

const TxSimulationBlock = ({ transactions, canExecute, gasLimit, disabled }: TxSimulationProps): ReactElement => {
  const { safe } = useSafeInfo()
  const wallet = useWallet()

  const { simulateTransaction, simulation, simulationRequestStatus, simulationLink, requestError, resetSimulation } =
    useSimulation()

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
    if (!wallet?.address) {
      return
    }

    simulateTransaction({
      safe,
      executionOwner: wallet.address,
      transactions,
      canExecute,
      gasLimit: simulationGasLimit,
    } as SimulationTxParams)
  }

  const isSimulationFinished =
    simulationRequestStatus === FETCH_STATUS.ERROR || simulationRequestStatus === FETCH_STATUS.SUCCESS
  const isSimulationLoading =
    simulationRequestStatus === FETCH_STATUS.LOADING ||
    (simulationRequestStatus !== FETCH_STATUS.NOT_ASKED && simulationGasLimit === 0)
  const showSimulationButton = !isSimulationFinished

  return showSimulationButton ? (
    <Accordion expanded={false} elevation={0}>
      <AccordionSummary className={css.simulateAccordion}>
        <Typography>Transaction validity</Typography>
        <Track {...MODALS_EVENTS.SIMULATE_TX}>
          <Button
            variant="text"
            size="small"
            disabled={disabled || isSimulationLoading}
            color="primary"
            onClick={handleSimulation}
          >
            {isSimulationLoading && <CircularProgress size={14} />}
            <span>{isSimulationLoading ? 'Simulating...' : 'Simulate'}</span>
          </Button>
        </Track>
      </AccordionSummary>
    </Accordion>
  ) : (
    <Accordion expanded elevation={0}>
      <SimulationResult
        onClose={resetSimulation}
        simulation={simulation}
        simulationRequestStatus={simulationRequestStatus}
        simulationLink={simulationLink}
        requestError={requestError}
      />
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
