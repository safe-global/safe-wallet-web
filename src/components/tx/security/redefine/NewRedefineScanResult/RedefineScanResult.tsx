import { useContext } from 'react'
import { NewSecurityHint, mapSeverityComponentProps } from '@/components/tx/security/shared/NewSecurityWarnings'
import { TransactionSecurityContext } from '../../TransactionSecurityContext'
import { SecuritySeverity } from '@/services/security/modules/types'
import { groupBy } from 'lodash'
import { Box, Checkbox, FormControlLabel, SvgIcon, Typography, Paper } from '@mui/material'
import ExternalLink from '@/components/common/ExternalLink'
import { FEATURES } from '@/utils/chains'
import { useHasFeature } from '@/hooks/useChains'
import { ErrorBoundary } from '@sentry/react'
import { REDEFINE_SIMULATION_URL } from '@/config/constants'
import css from '@/components/tx/security/shared/SecurityWarnings/styles.module.css'
// TODO: Refactor this so both modules can use the same styles
import tenderlyCss from '@/components/tx/NewTxSimulation/styles.module.css'
import RedefineLogoDark from '@/public/images/transactions/redefine-dark-mode.svg'
import RedefineLogo from '@/public/images/transactions/redefine.svg'
import Track from '@/components/common/Track'
import { MODALS_EVENTS } from '@/services/analytics'
import { useDarkMode } from '@/hooks/useDarkMode'
import CircularProgress from '@mui/material/CircularProgress'

const MAX_SHOWN_WARNINGS = 3

const RedefineBlock = () => {
  const { severity, isLoading, error, needsRiskConfirmation, isRiskConfirmed, setIsRiskConfirmed } =
    useContext(TransactionSecurityContext)

  const isDarkMode = useDarkMode()
  const severityProps = severity !== undefined ? mapSeverityComponentProps[severity] : undefined

  const toggleConfirmation = () => {
    setIsRiskConfirmed((prev) => !prev)
  }

  return (
    <div className={css.wrapperBox}>
      <Paper
        variant="outlined"
        className={tenderlyCss.wrapper}
        sx={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}
      >
        <div>
          <Typography variant="body2" fontWeight={700}>
            Scan for risks
          </Typography>

          <Typography variant="caption" className={tenderlyCss.poweredBy} position="relative">
            Powered by{' '}
            <SvgIcon
              inheritViewBox
              sx={{ height: '40px', width: '52px', position: 'absolute', right: '-58px' }}
              component={isDarkMode ? RedefineLogoDark : RedefineLogo}
            />
          </Typography>
        </div>

        <div className={tenderlyCss.result}>
          {isLoading ? (
            <CircularProgress size={30} />
          ) : severityProps ? (
            <Typography variant="body2" color={`${severityProps.color}.main`} className={tenderlyCss.result}>
              {severityProps.icon}
              {severityProps.label}
            </Typography>
          ) : error ? (
            <Typography variant="body2" color="error" className={tenderlyCss.result}>
              {error.message}
            </Typography>
          ) : null}
        </div>
      </Paper>
      <div>
        {needsRiskConfirmation && (
          <Box pl={2}>
            <Track {...MODALS_EVENTS.ACCEPT_RISK}>
              <FormControlLabel
                label="I understand the risks and would like to continue this transaction"
                control={<Checkbox checked={isRiskConfirmed} onChange={toggleConfirmation} />}
              />
            </Track>
          </Box>
        )}
      </div>
    </div>
  )
}

export const NewRedefine = () => {
  const isFeatureEnabled = useHasFeature(FEATURES.RISK_MITIGATION)

  if (!isFeatureEnabled) {
    return null
  }

  return (
    <ErrorBoundary fallback={<div>Error showing scan result</div>}>
      <RedefineBlock />
    </ErrorBoundary>
  )
}

export const RedefineMessage = () => {
  const { warnings, simulationUuid } = useContext(TransactionSecurityContext)

  /* Evaluate security warnings */
  const relevantWarnings = warnings.filter((warning) => warning.severity !== SecuritySeverity.NONE)
  const shownWarnings = relevantWarnings.slice(0, MAX_SHOWN_WARNINGS)
  const hiddenWarningCount = warnings.length - shownWarnings.length
  const hiddenMaxSeverity = hiddenWarningCount > 0 ? relevantWarnings[MAX_SHOWN_WARNINGS]?.severity : 0

  const groupedShownWarnings = groupBy(shownWarnings, (warning) => warning.severity)
  const sortedSeverities = Object.keys(groupedShownWarnings).sort((a, b) => (Number(a) < Number(b) ? 1 : -1))

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {sortedSeverities.map((key) => (
        <NewSecurityHint
          key={key}
          severity={Number(key)}
          warnings={groupedShownWarnings[key].map((warning) => warning.description.short)}
        />
      ))}
      {hiddenWarningCount > 0 && (
        <NewSecurityHint
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
  )
}
