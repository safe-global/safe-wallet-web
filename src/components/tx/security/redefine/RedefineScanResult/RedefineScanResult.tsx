import { useContext } from 'react'
import { SecurityHint, SecurityWarning } from '../../shared/SecurityWarnings'
import { TransactionSecurityContext } from '../../TransactionSecurityContext'
import { SecuritySeverity } from '@/services/security/modules/types'
import { groupBy } from 'lodash'

const MAX_SHOWN_WARNINGS = 3

export const RedefineScanResult = () => {
  const { warnings, verdict, isLoading, error } = useContext(TransactionSecurityContext)
  const relevantWarnings = warnings.filter((warning) => warning.severity !== SecuritySeverity.NONE)
  const shownWarnings =
    relevantWarnings && relevantWarnings.length > MAX_SHOWN_WARNINGS
      ? relevantWarnings.slice(0, MAX_SHOWN_WARNINGS)
      : relevantWarnings
  const hiddenWarningCount = warnings.length - shownWarnings.length
  const hiddenMaxSeverity = hiddenWarningCount > 0 ? relevantWarnings[MAX_SHOWN_WARNINGS]?.severity : 0

  const groupedShownWarnings = groupBy(shownWarnings, (warning) => warning.severity)
  const sortedSeverities = Object.keys(groupedShownWarnings).sort((a, b) => (Number(a) < Number(b) ? 1 : -1))

  return (
    <>
      <SecurityWarning severity={verdict} isLoading={isLoading} error={error} />
      {sortedSeverities.map((key) => (
        <SecurityHint
          key={key}
          severity={Number(key)}
          warnings={groupedShownWarnings[key].map((warning) => warning.description.short)}
        />
      ))}
      {hiddenWarningCount > 0 && (
        <SecurityHint severity={hiddenMaxSeverity} warnings={[`${hiddenWarningCount} more issues`]} />
      )}
    </>
  )
}
