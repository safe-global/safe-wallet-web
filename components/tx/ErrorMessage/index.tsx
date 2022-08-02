import { type ReactElement, type ReactNode, type SyntheticEvent, useState } from 'react'
import { Link, Typography } from '@mui/material'

const ErrorMessage = ({
  children,
  error,
}: {
  children: ReactNode
  error?: Error & { reason?: string }
}): ReactElement => {
  const [showDetails, setShowDetails] = useState<boolean>(false)

  const onDetailsToggle = (e: SyntheticEvent) => {
    e.preventDefault()
    setShowDetails((prev) => !prev)
  }

  return (
    <Typography color="error" mt={4} mb={1}>
      {children}&nbsp;
      {error && (
        <Link component="button" color="secondary.light" onClick={onDetailsToggle}>
          Details
        </Link>
      )}
      {error && showDetails && <Typography mt={1}>Error: {error.reason || error.message.slice(0, 300)}</Typography>}
    </Typography>
  )
}

export default ErrorMessage
