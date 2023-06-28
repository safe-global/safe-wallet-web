import { useContext } from 'react'
import { mapRedefineSeverity } from '@/components/tx/security/redefine/useRedefine'
import { TxSecurityContext } from '@/components/tx/security/shared/TxSecurityContext'
import { SecuritySeverity } from '@/services/security/modules/types'
import { groupBy } from 'lodash'
import { Alert, Box, Checkbox, FormControlLabel, Paper, SvgIcon, Typography } from '@mui/material'
import ExternalLink from '@/components/common/ExternalLink'
import { FEATURES } from '@/utils/chains'
import { useHasFeature } from '@/hooks/useChains'
import { ErrorBoundary } from '@sentry/react'
import { REDEFINE_SIMULATION_URL } from '@/config/constants'
import css from 'src/components/tx/security/redefine/styles.module.css'
import sharedCss from '@/components/tx/security/shared/styles.module.css'
import RedefineLogoDark from '@/public/images/transactions/redefine-dark-mode.svg'
import RedefineLogo from '@/public/images/transactions/redefine.svg'
import Track from '@/components/common/Track'
import { MODALS_EVENTS } from '@/services/analytics'
import { useDarkMode } from '@/hooks/useDarkMode'
import CircularProgress from '@mui/material/CircularProgress'
import { RedefineHint } from '@/components/tx/security/redefine/RedefineHint'

const MAX_SHOWN_WARNINGS = 3

const RedefineBlock = () => {
  const { severity, isLoading, error, needsRiskConfirmation, isRiskConfirmed, setIsRiskConfirmed } =
    useContext(TxSecurityContext)

  const isDarkMode = useDarkMode()
  const severityProps = severity !== undefined ? mapRedefineSeverity[severity] : undefined

  const toggleConfirmation = () => {
    setIsRiskConfirmed((prev) => !prev)
  }

  return (
    <div className={css.wrapperBox}>
      <Paper
        variant="outlined"
        className={sharedCss.wrapper}
        sx={needsRiskConfirmation ? { borderTop: 'none', borderLeft: 'none', borderRight: 'none' } : { border: 'none' }}
      >
        <div>
          <Typography variant="body2" fontWeight={700}>
            Scan for risks
          </Typography>

          <Typography variant="caption" className={sharedCss.poweredBy} position="relative">
            Powered by{' '}
            <SvgIcon
              inheritViewBox
              sx={{ height: '40px', width: '52px', position: 'absolute', right: '-58px' }}
              component={isDarkMode ? RedefineLogoDark : RedefineLogo}
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
          ) : severityProps ? (
            <Typography variant="body2" color={`${severityProps.color}.main`} className={sharedCss.result}>
              <SvgIcon
                component={severityProps.icon}
                inheritViewBox
                fontSize="small"
                sx={{ verticalAlign: 'middle', mr: 1 }}
              />
              {severityProps.label}
            </Typography>
          ) : error ? (
            <Typography variant="body2" color="error" className={sharedCss.result}>
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

export const Redefine = () => {
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
  const { severity, warnings, simulationUuid } = useContext(TxSecurityContext)

  /* Evaluate security warnings */
  const relevantWarnings = warnings.filter((warning) => warning.severity !== SecuritySeverity.NONE)
  const shownWarnings = relevantWarnings.slice(0, MAX_SHOWN_WARNINGS)
  const hiddenWarningCount = warnings.length - shownWarnings.length
  const hiddenMaxSeverity =
    hiddenWarningCount > 0 ? relevantWarnings[MAX_SHOWN_WARNINGS]?.severity : SecuritySeverity.NONE

  const groupedShownWarnings = groupBy(shownWarnings, (warning) => warning.severity)
  const sortedSeverities = Object.keys(groupedShownWarnings).sort((a, b) => (Number(a) < Number(b) ? 1 : -1))

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {sortedSeverities.map((key) => (
        <RedefineHint
          key={key}
          severity={Number(key)}
          warnings={groupedShownWarnings[key].map((warning) => warning.description.short)}
        />
      ))}
      {hiddenWarningCount > 0 && (
        <RedefineHint
          severity={hiddenMaxSeverity}
          warnings={[`${hiddenWarningCount} more issue${hiddenWarningCount > 1 ? 's' : ''}`]}
        />
      )}

      {simulationUuid && (
        <Alert severity="info" sx={{ border: 'unset' }}>
          {severity === SecuritySeverity.NONE && (
            <Typography variant="body2" fontWeight={700}>
              {mapRedefineSeverity[severity].label}
            </Typography>
          )}
          For a comprehensive risk overview,{' '}
          <ExternalLink href={`${REDEFINE_SIMULATION_URL}${simulationUuid}`}>
            see the full report on Redefine
          </ExternalLink>
        </Alert>
      )}
    </Box>
  )
}
