import { ReactElement, ReactNode } from 'react'
import { Typography } from '@mui/material'

const ErrorMessage = ({ children }: { children?: ReactNode }): ReactElement | null => {
  if (!children) return null

  return (
    <Typography color="error" paddingY={4}>
      {children}
    </Typography>
  )
}

export default ErrorMessage
