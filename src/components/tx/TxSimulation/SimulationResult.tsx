import { Alert, AlertTitle, Typography, Link } from '@mui/material'
import type { ReactElement } from 'react'

import { TenderlySimulation, FETCH_STATUS } from '@/components/tx/TxSimulation/types'

import css from './styles.module.css'

type SimulationResultProps = {
  simulationRequestStatus: string
  simulation?: TenderlySimulation
  simulationLink: string
  requestError?: string
  onClose: () => void
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
  if (requestError || !simulation?.simulation.status) {
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
            <Link href={simulationLink} target="_blank" rel="noreferrer">
              <b>on Tenderly</b>
            </Link>
            .
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
        <Link href={simulationLink} target="_blank" rel="noreferrer">
          <b>on Tenderly</b>
        </Link>
        .
      </Typography>
    </Alert>
  )
}
