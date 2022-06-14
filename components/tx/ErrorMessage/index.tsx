import { ReactElement, ReactNode } from 'react'
import { Typography } from '@mui/material'

const ErrorMessage = ({ children }: { children?: ReactNode }): ReactElement | null => {
  if (!children) return null

  return <Typography color="error">{children}</Typography>
}

export default ErrorMessage
