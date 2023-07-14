import { Alert, Button, Paper, SvgIcon, Tooltip, Typography } from '@mui/material'
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
import InfoIcon from '@/public/images/notifications/info.svg'

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
    simulation: { simulation, simulateTransaction, simulationRequestStatus, resetSimulation },
  } = useContext(TxInfoContext)

  const isLoading = simulationRequestStatus === FETCH_STATUS.LOADING
  const isSuccess = simulation?.simulation.status
  const isError = simulationRequestStatus === FETCH_STATUS.ERROR

  const isCallTraceError = isSuccess && getCallTraceErrors(simulation).length > 0

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
      <div className={css.wrapper}>
        <Typography variant="body2" fontWeight={700}>
          Run a simulation
          <Tooltip
            title="This transaction can be simulated before execution to ensure that it will be succeed, generating a detailed report of the transaction execution."
            arrow
            placement="top"
          >
            <span>
              <SvgIcon
                component={InfoIcon}
                inheritViewBox
                color="border"
                fontSize="small"
                sx={{
                  verticalAlign: 'middle',
                  ml: 0.5,
                }}
              />
            </span>
          </Tooltip>
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
            size={22}
            sx={{
              color: ({ palette }) => palette.text.secondary,
            }}
          />
        ) : isError || isCallTraceError ? (
          <Typography variant="body2" color="error.main" className={sharedCss.result}>
            <SvgIcon component={CloseIcon} inheritViewBox fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
            Error
          </Typography>
        ) : isSuccess ? (
          <Typography variant="body2" color="success.main" className={sharedCss.result}>
            <SvgIcon component={CheckIcon} inheritViewBox fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
            Success
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

  const isFinished = simulationRequestStatus === FETCH_STATUS.SUCCESS || simulationRequestStatus === FETCH_STATUS.ERROR

  if (!isFinished) {
    return null
  }

  const isSuccess = simulation?.simulation.status
  // Safe can emit failure event even though Tenderly simulation succeeds
  const isCallTraceError = isSuccess && getCallTraceErrors(simulation).length > 0
  const isError = simulationRequestStatus === FETCH_STATUS.ERROR

  if (!isSuccess || isError || isCallTraceError) {
    return (
      <Alert severity="error" sx={{ border: 'unset' }}>
        <Typography variant="body2" fontWeight={700}>
          Simulation failed
        </Typography>
        {requestError ? (
          <Typography color="error">
            An unexpected error occurred during simulation: <b>{requestError}</b>.
          </Typography>
        ) : (
          <Typography>
            {isCallTraceError ? (
              <>The transaction failed during the simulation.</>
            ) : (
              <>
                The transaction failed during the simulation throwing error{' '}
                <b>{simulation?.transaction.error_message}</b> in the contract at{' '}
                <b>{simulation?.transaction.error_info?.address}</b>.
              </>
            )}{' '}
            Full simulation report is available <ExternalLink href={simulationLink}>on Tenderly</ExternalLink>.
          </Typography>
        )}
      </Alert>
    )
  }

  return (
    <Alert severity="info" sx={{ border: 'unset' }}>
      <Typography variant="body2" fontWeight={700}>
        Simulation successful
      </Typography>
      Full simulation report is available <ExternalLink href={simulationLink}>on Tenderly</ExternalLink>.
    </Alert>
  )
}
