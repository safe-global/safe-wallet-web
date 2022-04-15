import { Alert, Snackbar, type SnackbarOrigin } from '@mui/material'
import { ReactElement } from 'react'

const position: SnackbarOrigin = { vertical: 'top', horizontal: 'right' }
const sx = { width: '100%' }

const ErrorToast = ({ message }: { message: string }): ReactElement => {
  return (
    <Snackbar anchorOrigin={position} open>
      <Alert severity="error" sx={sx}>
        {message}
      </Alert>
    </Snackbar>
  )
}

export default ErrorToast
