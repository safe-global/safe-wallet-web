import { useContext } from 'react'
import { SecurityHint, SecurityWarning } from '../../shared/SecurityWarnings'
import { TransactionSecurityContext } from '../../TransactionSecurityContext'
import { SecuritySeverity } from '@/services/security/modules/types'
import { groupBy } from 'lodash'
import { Box, Typography } from '@mui/material'
import ExternalLink from '@/components/common/ExternalLink'
import { FEATURES } from '@/utils/chains'
import { useHasFeature } from '@/hooks/useChains'
import { ErrorBoundary } from '@sentry/react'
import { REDEFINE_SIMULATION_URL } from '@/config/constants'

const MAX_SHOWN_WARNINGS = 3

const ScanWarnings = () => {
  /* Hooks */
  const {
    warnings,
    severity,
    isLoading,
    error,
    simulationUuid,
    needsRiskConfirmation,
    isRiskConfirmed,
    setIsRiskConfirmed,
  } = useContext(TransactionSecurityContext)

  /* Evaluate security warnings */
  const relevantWarnings = warnings.filter((warning) => warning.severity !== SecuritySeverity.NONE)
  const shownWarnings = relevantWarnings.slice(0, MAX_SHOWN_WARNINGS)
  const hiddenWarningCount = warnings.length - shownWarnings.length
  const hiddenMaxSeverity = hiddenWarningCount > 0 ? relevantWarnings[MAX_SHOWN_WARNINGS]?.severity : 0

  const groupedShownWarnings = groupBy(shownWarnings, (warning) => warning.severity)
  const sortedSeverities = Object.keys(groupedShownWarnings).sort((a, b) => (Number(a) < Number(b) ? 1 : -1))

  return (
    <SecurityWarning
      severity={severity}
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
          <SecurityHint
            severity={hiddenMaxSeverity}
            warnings={[`${hiddenWarningCount} more issue${hiddenWarningCount > 1 ? 's' : ''}`]}
          />
        )}

        {simulationUuid && (
          <Typography>
            For a comprehensive risk overview,{' '}
            <ExternalLink href={`${REDEFINE_SIMULATION_URL}${simulationUuid}`}>
              see the full report on Redefine
            </ExternalLink>
          </Typography>
        )}
      </Box>
    </SecurityWarning>
  )
}

export const RedefineScanResult = () => {
  const isFeatureEnabled = useHasFeature(FEATURES.RISK_MITIGATION)

  if (!isFeatureEnabled) {
    return null
  }

  return (
    <ErrorBoundary fallback={<div>Error showing scan result</div>}>
      <ScanWarnings />
    </ErrorBoundary>
  )
}
