import { Alert, type AlertColor, SvgIcon, Typography, Box, Grid, Checkbox } from '@mui/material'

import { SecuritySeverity } from '@/services/security/modules/types'
import AlertIcon from '@/public/images/notifications/alert.svg'

import css from './styles.module.css'
import { LoadingLabel } from '../LoadingLabel'

type SecurityWarningProps = {
  color: AlertColor
  label: string
  action?: string
}

const ACTION_REJECT = 'Reject this transaction'
const ACTION_REVIEW = 'Review before processing'

export const mapSeverityComponentProps: Record<SecuritySeverity, SecurityWarningProps> = {
  [SecuritySeverity.CRITICAL]: {
    action: ACTION_REJECT,
    color: 'error',
    label: 'Critical issues',
  },
  [SecuritySeverity.HIGH]: {
    action: ACTION_REJECT,
    color: 'error',
    label: 'High issues',
  },
  [SecuritySeverity.MEDIUM]: {
    action: ACTION_REVIEW,
    color: 'warning',
    label: 'Medium issues',
  },
  [SecuritySeverity.LOW]: {
    action: ACTION_REVIEW,
    color: 'warning',
    label: 'Low issues',
  },
  [SecuritySeverity.NONE]: {
    color: 'info',
    label: 'No issues found',
  },
}

export const SecurityHint = ({ severity, warnings }: { severity: SecuritySeverity; warnings: string[] }) => {
  const severityProps = mapSeverityComponentProps[severity]

  return (
    <>
      <Alert
        className={css.hint}
        severity={severityProps.color}
        sx={{ bgcolor: ({ palette }) => palette[severityProps.color].background }}
        icon={
          <SvgIcon
            component={AlertIcon}
            inheritViewBox
            color={severityProps.color}
            sx={{
              '& path': {
                fill: ({ palette }) => palette[severityProps.color].main,
              },
            }}
          />
        }
      >
        {severity !== SecuritySeverity.NONE && <Typography variant="h5">{severityProps.label}</Typography>}
        <Box display="flex" flexDirection="column" gap={2}>
          {warnings.map((warning) => (
            <Typography key={warning} variant="body2">
              {warning}
            </Typography>
          ))}
        </Box>
      </Alert>
    </>
  )
}

export const SecurityWarning = ({
  severity,
  isLoading,
  error,
}: {
  severity: SecuritySeverity | undefined
  isLoading: boolean
  error: Error | undefined
}) => {
  const severityProps = severity !== undefined ? mapSeverityComponentProps[severity] : undefined

  return (
    <Box className={css.wrapperBox}>
      <Box className={css.verdictBox}>
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Grid item direction="column">
            <Typography fontWeight={700} variant="subtitle1">
              Scan for risks
            </Typography>
            <Typography color="text.secondary">Powered by REDEFINE</Typography>
          </Grid>
          {isLoading ? (
            <LoadingLabel />
          ) : error ? (
            <Typography variant="body2" color="error">
              {error.message}
            </Typography>
          ) : (
            severityProps && (
              <Typography variant="body2" fontWeight={700} color={`${severityProps.color}.main`}>
                {severityProps.label}
              </Typography>
            )
          )}
        </Grid>
      </Box>
      {severityProps?.action === ACTION_REJECT && (
        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          <Checkbox></Checkbox>
          <Typography>I understand the risks and would like to continue this transaction.</Typography>
        </Box>
      )}
    </Box>
  )
}
