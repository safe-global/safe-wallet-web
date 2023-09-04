import CheckWallet from '@/components/common/CheckWallet'
import { Button } from '@mui/material'
import { useContext } from 'react'
import { TxSecurityContext } from '../security/shared/TxSecurityContext'

const SubmitButton = ({
  willExecute,
  submitDisabled,
  isEstimating,
}: {
  willExecute: boolean
  submitDisabled: boolean
  isEstimating: boolean
}) => {
  const { needsRiskConfirmation, isRiskConfirmed } = useContext(TxSecurityContext)

  const disableButton = submitDisabled || (needsRiskConfirmation && !isRiskConfirmed)
  return (
    <CheckWallet allowNonOwner={willExecute}>
      {(isOk) => (
        <Button variant="contained" type="submit" disabled={!isOk || disableButton}>
          {isEstimating ? 'Estimating...' : 'Submit'}
        </Button>
      )}
    </CheckWallet>
  )
}

export default SubmitButton
