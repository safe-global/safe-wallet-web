import { Alert, AlertTitle, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import type { TenderlySimulation } from '@/components/tx/TxSimulation/types'
import { FETCH_STATUS } from '@/components/tx/TxSimulation/types'

import css from './styles.module.css'
import ExternalLink from '@/components/common/ExternalLink'

type SimulationResultProps = {
  simulationRequestStatus: string
  simulation?: TenderlySimulation
  simulationLink: string
  requestError?: string
  onClose: () => void
}

const didRevert = (simulation: TenderlySimulation): boolean => {
  if (!simulation.simulation.status) {
    return true
  }

  // Safe emits `ExecutionFailure` when the gas/safeTxGas is too low
  // but the Tenderly simulation can still succeed
  const callErrors = simulation.transaction.call_trace.filter((call) => {
    return call.error
  })

  return callErrors.length > 0
}

export const SimulationResult = ({
  simulationRequestStatus,
  simulation,
  simulationLink,
  requestError,
  onClose,
}: SimulationResultProps): ReactElement | null => {
  const isSimulationFinished =
    simulationRequestStatus === FETCH_STATUS.SUCCESS || simulationRequestStatus === FETCH_STATUS.ERROR

  // Loading
  if (!isSimulationFinished) {
    return null
  }

  // Error
  if (requestError || !simulation || didRevert(simulation)) {
    return (
      <Alert severity="error" onClose={onClose} className={css.result}>
        <AlertTitle color="error">
          <b>Failed</b>
        </AlertTitle>

        {requestError ? (
          <Typography color="error">
            An unexpected error occurred during simulation: <b>{requestError}</b>.
          </Typography>
        ) : (
          <Typography>
            The transaction failed during the simulation throwing error <b>{simulation?.transaction.error_message}</b>{' '}
            in the contract at <b>{simulation?.transaction.error_info?.address}</b>. Full simulation report is available{' '}
            <ExternalLink href={simulationLink}>on Tenderly</ExternalLink>.
          </Typography>
        )}
      </Alert>
    )
  }

  // Success
  return (
    <Alert severity="success" onClose={onClose} className={css.result}>
      <AlertTitle color="success">
        <b>Success</b>
      </AlertTitle>

      <Typography>
        The transaction was successfully simulated. Full simulation report is available{' '}
        <ExternalLink href={simulationLink}>on Tenderly</ExternalLink>.
      </Typography>
    </Alert>
  )
}
