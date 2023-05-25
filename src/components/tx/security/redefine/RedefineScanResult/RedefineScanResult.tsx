import { useContext } from 'react'
import { SecurityHint, SecurityWarning } from '../../shared/SecurityWarnings'
import { TransactionSecurityContext } from '../../TransactionSecurityContext'

export const RedefineScanResult = () => {
  const { warnings, verdict, isLoading } = useContext(TransactionSecurityContext)
  console.log(warnings, verdict)
  return (
    <>
      {warnings.map((issue) => (
        <SecurityHint key={issue.category} severity={issue.severity} text={issue.description.short} />
      ))}
      <SecurityWarning severity={verdict} isLoading={isLoading} />
    </>
  )
}
