import { Alert, AlertTitle, Typography } from '@mui/material'
import Link from 'next/link'
import { ReactElement } from 'react'
import { TenderlySimulation, FETCH_STATUS } from './types'

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
      <Alert severity="error" onClose={onClose}>
        <AlertTitle>
          <Typography color="error">Failed</Typography>
        </AlertTitle>

        {requestError ? (
          <Typography color="error">
            An unexpected error occurred during simulation: <b>{requestError}</b>
          </Typography>
        ) : (
          <Typography>
            The transaction failed during the simulation throwing error <b>{simulation?.transaction.error_message}</b>{' '}
            in the contract at <b>{simulation?.transaction.error_info?.address}</b>. Full simulation report is available{' '}
            <Link href={simulationLink} target="_blank" rel="noreferrer">
              on Tenderly
            </Link>
            .
          </Typography>
        )}
      </Alert>
    )
  }

  // Success
  return (
    <Alert severity="success" onClose={onClose}>
      <AlertTitle>
        <Typography>Success</Typography>
      </AlertTitle>

      <Typography>
        The transaction was successfully simulated. Full simulation report is available{' '}
        <Link href={simulationLink} target="_blank" rel="noreferrer">
          on Tenderly
        </Link>
        .
      </Typography>
    </Alert>
  )
}
