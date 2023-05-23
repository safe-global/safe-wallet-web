import { Alert, type AlertColor, Checkbox, FormControlLabel, SvgIcon, Typography } from '@mui/material'

import { SecuritySeverity } from '@/services/security/modules/types'
import AlertIcon from '@/public/images/notifications/alert.svg'

import css from './styles.module.css'

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

export const SecurityWarning = ({ severity }: { severity: SecuritySeverity }) => {
  const severityProps = mapSeverityComponentProps[severity]

  return (
    <>
      <Alert
        className={css.warning}
        sx={{ borderLeft: ({ palette }) => `8px solid ${palette[severityProps.color].main} !important` }}
        severity={severityProps.color}
        icon={false}
      >
        {severityProps.action && (
          <>
            <Typography sx={{ color: ({ palette }) => palette[severityProps.color].main }} variant="body2">
              Recommended action
            </Typography>
            <Typography variant="h5">{severityProps.action}</Typography>
          </>
        )}
      </Alert>
      {(severity === SecuritySeverity.CRITICAL || severity === SecuritySeverity.HIGH) && (
        <FormControlLabel
          className={css.checkbox}
          control={<Checkbox />}
          label="I understand the risks and would like to continue this 
transaction."
        />
      )}
    </>
  )
}
