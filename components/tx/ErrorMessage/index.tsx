import { ReactElement, ReactNode } from 'react'
import { Typography } from '@mui/material'

const ErrorMessage = ({
  children,
  error,
}: {
  children?: ReactNode
  error?: Error & { reason?: string }
}): ReactElement | null => {
  if (!children) return null

  return (
    <Typography color="error" paddingY={4}>
      {children}

      {error && (
        <code>
          <br />
          Error: {error.reason || error.message.slice(0, 100)}
        </code>
      )}
    </Typography>
  )
}

export default ErrorMessage
