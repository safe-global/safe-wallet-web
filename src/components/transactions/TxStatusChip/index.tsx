import type { ReactElement, ReactNode } from 'react'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'

export type TxStatusChipProps = {
  children: ReactNode
  color?: 'primary' | 'secondary' | 'info' | 'warning' | 'success' | 'error'
}

const TxStatusChip = ({ children, color }: TxStatusChipProps): ReactElement => {
  return (
    <Chip
      size="small"
      sx={{
        backgroundColor: `${color}.background`,
        color: `${color}.${color === 'success' ? 'dark' : color === 'primary' ? 'light' : 'main'}`,
      }}
      label={
        <Typography
          variant="caption"
          sx={{
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.7,
          }}
        >
          {children}
        </Typography>
      }
    />
  )
}

export default TxStatusChip
