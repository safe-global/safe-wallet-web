import CheckWallet from '@/components/common/CheckWallet'
import { TxModalContext } from '@/components/tx-flow'
import { NewTxFlow } from '@/components/tx-flow/flows'
import ActivateAccountFlow from '@/features/counterfactual/ActivateAccountFlow'
import { PendingSafeStatus, selectUndeployedSafe } from '@/features/counterfactual/store/undeployedSafesSlice'
import useSafeInfo from '@/hooks/useSafeInfo'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import { useAppSelector } from '@/store'
import Button from '@mui/material/Button'
import { type ReactElement, useContext } from 'react'
import WatchlistAddButton from '../WatchlistAddButton'

const ActivateSafeButton = ({ disabled }: { disabled: boolean }) => {
  const { setTxFlow } = useContext(TxModalContext)

  const onActivateSafe = () => {
    trackEvent({ ...OVERVIEW_EVENTS.CHOOSE_TRANSACTION_TYPE, label: 'activate_safe' })
    setTxFlow(<ActivateAccountFlow />)
  }

  return (
    <Button
      onClick={onActivateSafe}
      variant="contained"
      size="small"
      fullWidth
      disableElevation
      sx={{ py: 1.3 }}
      disabled={disabled}
    >
      Activate Safe
    </Button>
  )
}

const NewTxButton = (): ReactElement => {
  const { safe, safeAddress } = useSafeInfo()
  const undeployedSafe = useAppSelector((state) => selectUndeployedSafe(state, safe.chainId, safeAddress))

  const { setTxFlow } = useContext(TxModalContext)

  const onClick = () => {
    setTxFlow(<NewTxFlow />, undefined, false)
    trackEvent({ ...OVERVIEW_EVENTS.NEW_TRANSACTION, label: 'sidebar' })
  }

  if (!!undeployedSafe)
    return <ActivateSafeButton disabled={undeployedSafe.status.status !== PendingSafeStatus.AWAITING_EXECUTION} />

  return (
    <CheckWallet allowSpendingLimit noTooltip>
      {(isOk) =>
        isOk ? (
          <Button
            data-testid="new-tx-btn"
            onClick={onClick}
            variant="contained"
            size="small"
            disabled={!isOk}
            fullWidth
            disableElevation
            sx={{ py: 1.3 }}
          >
            New transaction
          </Button>
        ) : (
          <WatchlistAddButton />
        )
      }
    </CheckWallet>
  )
}

export default NewTxButton
