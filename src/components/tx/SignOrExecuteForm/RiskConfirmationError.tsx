import { useContext } from 'react'
import ErrorMessage from '../ErrorMessage'
import { TxSecurityContext } from '../security/shared/TxSecurityContext'

const RiskConfirmationError = () => {
  const { isRiskConfirmed, isRiskIgnored } = useContext(TxSecurityContext)

  if (isRiskConfirmed || !isRiskIgnored) {
    return null
  }

  return <ErrorMessage level="warning">Please acknowledge the risk before proceeding.</ErrorMessage>
}

export default RiskConfirmationError
