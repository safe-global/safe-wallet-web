import { Alert, type AlertColor, SvgIcon, Typography, Box, Grid } from '@mui/material'

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
    label: 'Critical risk',
  },
  [SecuritySeverity.HIGH]: {
    action: ACTION_REJECT,
    color: 'error',
    label: 'High risk',
  },
  [SecuritySeverity.MEDIUM]: {
    action: ACTION_REVIEW,
    color: 'warning',
    label: 'Medium risk',
  },
  [SecuritySeverity.LOW]: {
    action: ACTION_REVIEW,
    color: 'warning',
    label: 'Low risk',
  },
  [SecuritySeverity.NONE]: {
    color: 'info',
    label: 'No issues found',
  },
}

export const SecurityHint = ({ severity, text }: { severity: SecuritySeverity; text: string }) => {
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
        <Typography variant="h5">{severityProps.label}</Typography>
        {severity !== SecuritySeverity.NONE && <Typography variant="body2">{text}</Typography>}
      </Alert>
    </>
  )
}

export const SecurityWarning = ({
  severity,
  isLoading,
}: {
  severity: SecuritySeverity | undefined
  isLoading: boolean
}) => {
  const severityProps = severity !== undefined ? mapSeverityComponentProps[severity] : undefined

  return (
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
        ) : (
          severityProps && (
            <Typography variant="body2" fontWeight={700} color={`${severityProps.color}.main`}>
              {severityProps.label}
            </Typography>
          )
        )}
      </Grid>
    </Box>
  )
}
