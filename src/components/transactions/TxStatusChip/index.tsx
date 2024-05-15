import type { ReactElement, ReactNode } from 'react'
import { Typography, Chip } from '@mui/material'

const TxStatusChip = ({
  children,
  color,
}: {
  children: ReactNode
  color?: 'primary' | 'secondary' | 'info' | 'warning' | 'success' | 'error'
}): ReactElement => {
  return (
    <Chip
      size="small"
      sx={{ backgroundColor: `${color}.background`, color: `${color}.dark` }}
      label={
        <Typography variant="caption" fontWeight="bold" display="flex" alignItems="center" gap={1}>
          {children}
        </Typography>
      }
    />
  )
}

export default TxStatusChip
