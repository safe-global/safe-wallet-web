import type { ReactElement, ReactNode } from 'react'
import { Box, Chip } from '@mui/material'

const TxStatusChip = ({ children, color }: { children: ReactNode; color?: string }): ReactElement => {
  return (
    <Chip
      size="small"
      sx={{ backgroundColor: `${color}.background` }}
      label={
        <Box display="flex" alignItems="center" gap={1} color={`${color}.dark`}>
          {children}
        </Box>
      }
    />
  )
}

export default TxStatusChip
