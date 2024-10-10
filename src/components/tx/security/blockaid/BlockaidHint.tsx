import { List, ListItem, Typography } from '@mui/material'

export const BlockaidHint = ({ warnings }: { warnings: string[] }) => {
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
