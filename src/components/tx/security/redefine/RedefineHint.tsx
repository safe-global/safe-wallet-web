import { SecuritySeverity } from '@/services/security/modules/types'
import { Alert, Box, List, ListItem, SvgIcon, Typography } from '@mui/material'
import css from 'src/components/tx/security/redefine/styles.module.css'
import AlertIcon from '@/public/images/notifications/alert.svg'
import { mapRedefineSeverity } from '@/components/tx/security/redefine/useRedefine'

export const RedefineHint = ({ severity, warnings }: { severity: SecuritySeverity; warnings: string[] }) => {
  const severityProps = mapRedefineSeverity[severity]
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
