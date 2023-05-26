import { useContext } from 'react'
import { SecurityHint, SecurityWarning } from '../../shared/SecurityWarnings'
import { TransactionSecurityContext } from '../../TransactionSecurityContext'
import { SecuritySeverity } from '@/services/security/modules/types'

const MAX_SHOWN_WARNINGS = 2

export const RedefineScanResult = () => {
  const { warnings, verdict, isLoading } = useContext(TransactionSecurityContext)
  const relevantWarnings = warnings.filter((warning) => warning.severity !== SecuritySeverity.NONE)
  const shownWarnings =
    relevantWarnings.length > MAX_SHOWN_WARNINGS ? relevantWarnings.slice(0, MAX_SHOWN_WARNINGS) : relevantWarnings
  const hiddenWarningCount = warnings.length - shownWarnings.length

  return (
    <>
      <SecurityWarning severity={verdict} isLoading={isLoading} />
      {shownWarnings.map((issue) => (
        <SecurityHint key={issue.category} severity={issue.severity} text={issue.description.short} />
      ))}
      {hiddenWarningCount > 0 && (
        <SecurityHint severity={SecuritySeverity.NONE} text={`${hiddenWarningCount} more issues`} />
      )}
    </>
  )
}
