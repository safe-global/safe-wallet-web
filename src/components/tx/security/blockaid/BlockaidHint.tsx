import { type SecuritySeverity } from '@/services/security/modules/types'
import { List, ListItem, Typography } from '@mui/material'
import { mapSecuritySeverity } from '../utils'

export const BlockaidHint = ({ severity, warnings }: { severity: SecuritySeverity; warnings: string[] }) => {
  const severityProps = mapSecuritySeverity[severity]

  return (
    <List sx={{ listStyle: 'disc', pl: 2, '& li:last-child': { m: 0 } }}>
      {warnings.map((warning) => (
        <ListItem key={warning} disablePadding sx={{ display: 'list-item', mb: 1 }}>
          <Typography variant="body2">{warning}</Typography>
        </ListItem>
      ))}
    </List>
  )
}
