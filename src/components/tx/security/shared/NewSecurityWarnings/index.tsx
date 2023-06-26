import { Alert, type AlertColor, Box, List, ListItem, SvgIcon, Typography } from '@mui/material'

import { SecuritySeverity } from '@/services/security/modules/types'
import AlertIcon from '@/public/images/notifications/alert.svg'

import css from './styles.module.css'
import CheckIcon from '@/public/images/common/check.svg'
import CloseIcon from '@/public/images/common/close.svg'
import InfoIcon from '@/public/images/notifications/info.svg'

type SecurityWarningProps = {
  color: AlertColor
  icon: JSX.Element
  label: string
  action?: string
}

const ACTION_REJECT = 'Reject this transaction'
const ACTION_REVIEW = 'Review before processing'

export const mapSeverityComponentProps: Record<SecuritySeverity, SecurityWarningProps> = {
  [SecuritySeverity.CRITICAL]: {
    action: ACTION_REJECT,
    color: 'error',
    icon: <SvgIcon component={CloseIcon} inheritViewBox fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />,
    label: 'Critical issue',
  },
  [SecuritySeverity.HIGH]: {
    action: ACTION_REJECT,
    color: 'error',
    icon: <SvgIcon component={CloseIcon} inheritViewBox fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />,
    label: 'High issue',
  },
  [SecuritySeverity.MEDIUM]: {
    action: ACTION_REVIEW,
    color: 'warning',
    icon: <SvgIcon component={InfoIcon} inheritViewBox fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />,
    label: 'Medium issue',
  },
  [SecuritySeverity.LOW]: {
    action: ACTION_REVIEW,
    color: 'warning',
    icon: <SvgIcon component={InfoIcon} inheritViewBox fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />,
    label: 'Low issue',
  },
  [SecuritySeverity.NONE]: {
    color: 'info',
    icon: <SvgIcon component={CheckIcon} inheritViewBox fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />,
    label: 'No issues found',
  },
}

export const NewSecurityHint = ({ severity, warnings }: { severity: SecuritySeverity; warnings: string[] }) => {
  const severityProps = mapSeverityComponentProps[severity]
  const pluralizedLabel = (
    <>
      {warnings.length} {severityProps.label}
      {warnings.length > 1 ? 's' : ''}
    </>
  )

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
        {severity !== SecuritySeverity.NONE && (
          <Typography variant="body2" fontWeight={700}>
            {pluralizedLabel}
          </Typography>
        )}
        <Box display="flex" flexDirection="column" gap={2}>
          <List sx={{ listStyle: 'disc', pl: 2, '& li:last-child': { m: 0 } }}>
            {warnings.map((warning) => (
              <ListItem key={warning} disablePadding sx={{ display: 'list-item', mb: 1 }}>
                <Typography variant="body2">{warning}</Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      </Alert>
    </>
  )
}
