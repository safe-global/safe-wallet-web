import { Alert, Checkbox, FormControlLabel, SvgIcon, Typography } from '@mui/material'
import type { AlertProps } from '@mui/material'

import { SecuritySeverity } from '@/services/security/modules/types'
import AlertIcon from '@/public/images/notifications/alert.svg'

import css from './styles.module.css'

export const _mapSeverity = (severity: SecuritySeverity): NonNullable<AlertProps['severity']> => {
  switch (severity) {
    case SecuritySeverity.CRITICAL:
    case SecuritySeverity.HIGH:
      return 'error'

    case SecuritySeverity.MEDIUM:
    case SecuritySeverity.LOW:
      return 'warning'

    case SecuritySeverity.NONE:
      return 'success'
  }
}

export const _mapRisk = (severity: SecuritySeverity): string => {
  switch (severity) {
    case SecuritySeverity.CRITICAL:
      return 'Critical risk'

    case SecuritySeverity.HIGH:
      return 'High risk'

    case SecuritySeverity.MEDIUM:
      return 'Medium risk'

    case SecuritySeverity.LOW:
      return 'Low risk'

    case SecuritySeverity.NONE:
      return 'No issues found'
  }
}

export const SecurityHint = (props: { severity: SecuritySeverity; text: string }) => {
  const severity = _mapSeverity(props.severity)
  const risk = _mapRisk(props.severity)

  return (
    <>
      <Alert
        className={css.hint}
        severity={severity}
        sx={{ bgcolor: ({ palette }) => palette[severity].background }}
        icon={
          <SvgIcon
            component={AlertIcon}
            inheritViewBox
            color={severity}
            sx={{
              '& path': {
                fill: ({ palette }) => palette[severity].main,
              },
            }}
          />
        }
      >
        <Typography variant="h5">{risk}</Typography>
        {props.severity !== SecuritySeverity.NONE && <Typography variant="body2">{props.text}</Typography>}
      </Alert>
    </>
  )
}

export const _mapAction = (severity: SecuritySeverity): string => {
  switch (severity) {
    case SecuritySeverity.CRITICAL:
    case SecuritySeverity.HIGH:
      return 'Reject this transaction'

    case SecuritySeverity.MEDIUM:
    case SecuritySeverity.LOW:
      return 'Review before processing'

    case SecuritySeverity.NONE:
      return 'Continue the transaction'
  }
}

export const SecurityWarning = (props: { severity: SecuritySeverity }) => {
  const severity = _mapSeverity(props.severity)
  const action = _mapAction(props.severity)

  return (
    <>
      <Alert
        className={css.warning}
        sx={{ borderLeft: ({ palette }) => `8px solid ${palette[severity].main} !important` }}
        severity={severity}
        icon={false}
      >
        <Typography sx={{ color: ({ palette }) => palette[severity].main }} variant="body2">
          Recommended action
        </Typography>
        <Typography variant="h5">{action}</Typography>
      </Alert>
      {(props.severity === SecuritySeverity.CRITICAL || props.severity === SecuritySeverity.HIGH) && (
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
