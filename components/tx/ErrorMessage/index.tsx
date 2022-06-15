import { ReactElement, ReactNode } from 'react'
import { Typography } from '@mui/material'

const ErrorMessage = ({ children }: { children?: ReactNode }): ReactElement | null => {
  if (!children) return null

  return (
    <Typography color="error" sx={{ padding: '2em 0' }}>
      {children}
    </Typography>
  )
}

export default ErrorMessage
