import { useContext } from 'react'
import { SecurityHint, SecurityWarning } from '../../shared/SecurityWarnings'
import { TransactionSecurityContext } from '../../TransactionSecurityContext'
import { SecuritySeverity } from '@/services/security/modules/types'
import { groupBy } from 'lodash'
import { Box } from '@mui/material'
import ExternalLink from '@/components/common/ExternalLink'
import { FEATURES } from '@/utils/chains'
import { useHasFeature } from '@/hooks/useChains'

const MAX_SHOWN_WARNINGS = 3

const REDEFINE_SIMULATION_URL = 'https://app.redefine.net/defirewall-tx/'

export const RedefineScanResult = () => {
  /* Hooks */
  const {
    warnings,
    verdict,
    isLoading,
    error,
    simulationUuid,
    needsRiskConfirmation,
    isRiskConfirmed,
    setIsRiskConfirmed,
  } = useContext(TransactionSecurityContext)
  const isFeatureEnabled = useHasFeature(FEATURES.RISK_MITIGATION)

  /* Evaluate security warnings */
  const relevantWarnings = warnings.filter((warning) => warning.severity !== SecuritySeverity.NONE)
  const shownWarnings =
    relevantWarnings && relevantWarnings.length > MAX_SHOWN_WARNINGS
      ? relevantWarnings.slice(0, MAX_SHOWN_WARNINGS)
      : relevantWarnings
  const hiddenWarningCount = warnings.length - shownWarnings.length
  const hiddenMaxSeverity = hiddenWarningCount > 0 ? relevantWarnings[MAX_SHOWN_WARNINGS]?.severity : 0

  const groupedShownWarnings = groupBy(shownWarnings, (warning) => warning.severity)
  const sortedSeverities = Object.keys(groupedShownWarnings).sort((a, b) => (Number(a) < Number(b) ? 1 : -1))

  if (!isFeatureEnabled) {
    return null
  }

  return (
    <SecurityWarning
      severity={verdict}
      isLoading={isLoading}
      error={error}
      isConfirmed={isRiskConfirmed}
      needsConfirmation={needsRiskConfirmation}
      setIsConfirmed={setIsRiskConfirmed}
    >
      <Box display="flex" flexDirection="column" gap={1}>
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

        {simulationUuid && (
          <ExternalLink href={`${REDEFINE_SIMULATION_URL}${simulationUuid}`}>View full report</ExternalLink>
        )}
      </Box>
    </SecurityWarning>
  )
}
