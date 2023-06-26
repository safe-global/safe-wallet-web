import { Alert, Button, Paper, SvgIcon, Typography } from '@mui/material'
import { useContext, useEffect } from 'react'
import type { ReactElement } from 'react'

import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import CheckIcon from '@/public/images/common/check.svg'
import CloseIcon from '@/public/images/common/close.svg'
import { useDarkMode } from '@/hooks/useDarkMode'
import CircularProgress from '@mui/material/CircularProgress'
import ExternalLink from '@/components/common/ExternalLink'
import { useCurrentChain } from '@/hooks/useChains'
import { FETCH_STATUS } from '@/components/tx/security/tenderly/types'
import { isTxSimulationEnabled } from '@/components/tx/security/tenderly/utils'
import type { SimulationTxParams } from '@/components/tx/security/tenderly/utils'
import type { TenderlySimulation } from '@/components/tx/security/tenderly/types'

import css from './styles.module.css'
import sharedCss from '@/components/tx/security/shared/styles.module.css'
import { TxInfoContext } from '@/components/tx-flow/TxInfoProvider'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'

export type TxSimulationProps = {
  transactions?: SimulationTxParams['transactions']
  gasLimit?: number
  disabled: boolean
}

const getCallTraceErrors = (simulation?: TenderlySimulation) => {
  if (!simulation || !simulation.simulation.status) {
    return []
  }

  return simulation.transaction.call_trace.filter((call) => call.error)
}

// TODO: Investigate resetting on gasLimit change as we are not simulating with the gasLimit of the tx
// otherwise remove all usage of gasLimit in simulation. Note: this was previously being done.
const TxSimulationBlock = ({ transactions, disabled, gasLimit }: TxSimulationProps): ReactElement => {
  const { safe } = useSafeInfo()
  const wallet = useWallet()
  const isDarkMode = useDarkMode()
  const { safeTx } = useContext(SafeTxContext)
  const {
    simulation: { simulateTransaction, simulationRequestStatus, resetSimulation },
  } = useContext(TxInfoContext)

  const isLoading = simulationRequestStatus === FETCH_STATUS.LOADING
  const isSuccess = simulationRequestStatus === FETCH_STATUS.SUCCESS
  const isError = simulationRequestStatus === FETCH_STATUS.ERROR

  const handleSimulation = async () => {
    if (!wallet) {
      return
    }

    simulateTransaction({
      safe,
      executionOwner: wallet.address,
      transactions,
      gasLimit,
    } as SimulationTxParams)
  }

  // Reset simulation if safeTx changes
  useEffect(() => {
    resetSimulation()
  }, [safeTx, resetSimulation])

  return (
    <Paper variant="outlined" className={sharedCss.wrapper}>
      <div>
        <Typography variant="body2" fontWeight={700}>
          Simulate transaction
        </Typography>
        <Typography variant="caption" className={sharedCss.poweredBy}>
          Powered by{' '}
          <img
            src={isDarkMode ? '/images/transactions/tenderly-light.svg' : '/images/transactions/tenderly-dark.svg'}
            alt="Tenderly"
            width="65px"
            height="15px"
          />
        </Typography>
      </div>

      <div className={sharedCss.result}>
        {isLoading ? (
          <CircularProgress
            size={30}
            sx={{
              color: ({ palette }) => palette.text.secondary,
            }}
          />
        ) : isSuccess ? (
          <Typography variant="body2" color="success.main" className={sharedCss.result}>
            <SvgIcon component={CheckIcon} inheritViewBox fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
            Success
          </Typography>
        ) : isError ? (
          <Typography variant="body2" color="error.main" className={sharedCss.result}>
            <SvgIcon component={CloseIcon} inheritViewBox fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
            Error
          </Typography>
        ) : (
          <Button
            variant="outlined"
            size="small"
            className={css.simulate}
            onClick={handleSimulation}
            disabled={!transactions || disabled}
          >
            Simulate
          </Button>
        )}
      </div>
    </Paper>
  )
}

export const TxSimulation = (props: TxSimulationProps): ReactElement | null => {
  const chain = useCurrentChain()

  if (!chain || !isTxSimulationEnabled(chain)) {
    return null
  }

  return <TxSimulationBlock {...props} />
}

export const TxSimulationMessage = () => {
  const {
    simulation: { simulationRequestStatus, simulationLink, simulation, requestError },
  } = useContext(TxInfoContext)

  const isSuccess = simulationRequestStatus === FETCH_STATUS.SUCCESS
  const isError = simulationRequestStatus === FETCH_STATUS.ERROR
  const isFinished = isSuccess || isError

  // Safe can emit failure event even though Tenderly simulation succeeds
  const isCallTraceError = getCallTraceErrors(simulation).length > 0

  if (!isFinished) {
    return null
  }

  return (
    <div>
      {isSuccess ? (
        <Alert severity="info" sx={{ border: 'unset' }}>
          <Typography variant="body2" fontWeight={700}>
            Simulation successful
          </Typography>
          Full simulation report is available <ExternalLink href={simulationLink}>on Tenderly</ExternalLink>.
        </Alert>
      ) : isError ? (
        <Alert severity="error" sx={{ border: 'unset' }}>
          <Typography variant="body2" fontWeight={700}>
            Simulation failed
          </Typography>
          {requestError ? (
            <>
              An unexpected error occurred during simulation: <b>{requestError}</b>.
            </>
          ) : isCallTraceError ? (
            'The transaction failed during the simulation.'
          ) : (
            <>
              The transaction failed during the simulation throwing error <b>{simulation?.transaction.error_message}</b>{' '}
              in the contract at <b>{simulation?.transaction.error_info?.address}</b>.
            </>
          )}{' '}
          Full simulation report is available <ExternalLink href={simulationLink}>on Tenderly</ExternalLink>.
        </Alert>
      ) : null}
    </div>
  )
}
