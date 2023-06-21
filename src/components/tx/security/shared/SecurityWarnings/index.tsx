import {
  Alert,
  type AlertColor,
  SvgIcon,
  Typography,
  Box,
  Grid,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  List,
  ListItem,
} from '@mui/material'

import { SecuritySeverity } from '@/services/security/modules/types'
import AlertIcon from '@/public/images/notifications/alert.svg'

import css from './styles.module.css'
import { LoadingLabel } from '../LoadingLabel'
import { type Dispatch, type ReactElement, type SetStateAction, useCallback } from 'react'
import RedefineLogo from '@/public/images/transactions/redefine.svg'
import RedefineLogoDark from '@/public/images/transactions/redefine-dark-mode.svg'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Track from '@/components/common/Track'
import { MODALS_EVENTS } from '@/services/analytics'
import { useDarkMode } from '@/hooks/useDarkMode'

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
    label: 'Critical issue',
  },
  [SecuritySeverity.HIGH]: {
    action: ACTION_REJECT,
    color: 'error',
    label: 'High issue',
  },
  [SecuritySeverity.MEDIUM]: {
    action: ACTION_REVIEW,
    color: 'warning',
    label: 'Medium issue',
  },
  [SecuritySeverity.LOW]: {
    action: ACTION_REVIEW,
    color: 'warning',
    label: 'Low issue',
  },
  [SecuritySeverity.NONE]: {
    color: 'info',
    label: 'No issues found',
  },
}

export const SecurityHint = ({ severity, warnings }: { severity: SecuritySeverity; warnings: string[] }) => {
  const severityProps = mapSeverityComponentProps[severity]
  const pluralizedLabel = `${severityProps.label}${warnings.length > 1 ? 's' : ''}`
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
        {severity !== SecuritySeverity.NONE && <Typography variant="h5">{pluralizedLabel}</Typography>}
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

export const SecurityWarning = ({
  severity,
  isLoading,
  error,
  children,
  needsConfirmation,
  isConfirmed,
  setIsConfirmed,
}: {
  severity: SecuritySeverity | undefined
  isLoading: boolean
  error: Error | undefined
  children: ReactElement
  needsConfirmation: boolean
  isConfirmed: boolean
  setIsConfirmed: Dispatch<SetStateAction<boolean>>
}) => {
  const isDarkMode = useDarkMode()
  const severityProps = severity !== undefined ? mapSeverityComponentProps[severity] : undefined

  const toggleConfirmation = useCallback(() => {
    setIsConfirmed((prev) => !prev)
  }, [setIsConfirmed])

  return (
    <Box className={css.wrapperBox}>
      <Accordion className={css.verdictBox}>
        <AccordionSummary sx={{ mb: 0 }} expandIcon={<ExpandMoreIcon />}>
          <Grid container direction="row" justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography fontWeight={700} variant="subtitle1">
                Scan for risks
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                display="flex"
                flexDirection="row"
                gap={1}
                alignItems="center"
                position="relative"
              >
                Powered by{' '}
                <SvgIcon
                  inheritViewBox
                  sx={{ height: '40px', width: '52px', position: 'absolute', right: '-20px' }}
                  component={isDarkMode ? RedefineLogoDark : RedefineLogo}
                />
              </Typography>
            </Grid>

            {isLoading ? (
              <LoadingLabel />
            ) : severityProps ? (
              <Typography variant="body2" fontWeight={700} color={`${severityProps.color}.main`}>
                {severityProps.label}
              </Typography>
            ) : error ? (
              <Typography variant="body2" fontWeight={700} color="error">
                {error.message}
              </Typography>
            ) : null}
          </Grid>
        </AccordionSummary>

        <AccordionDetails>{children}</AccordionDetails>
      </Accordion>

      {needsConfirmation && (
        <Box pl={2}>
          <Track {...MODALS_EVENTS.ACCEPT_RISK}>
            <FormControlLabel
              label="I understand the risks and would like to continue this transaction"
              control={<Checkbox checked={isConfirmed} onChange={toggleConfirmation} />}
            />
          </Track>
        </Box>
      )}
    </Box>
  )
}
