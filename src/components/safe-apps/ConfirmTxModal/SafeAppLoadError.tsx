import { ReactElement } from 'react'
import { Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { ConfirmTxModalProps } from '.'

export const SafeAppLoadError = ({ onTxReject, onClose, requestId }: ConfirmTxModalProps): ReactElement => {
  const handleTxRejection = () => {
    onTxReject(requestId)
    onClose()
  }

  return (
    <div>
      <DialogContent>
        <Typography>Transaction error</Typography>
        <Typography>
          This Safe App initiated a transaction which cannot be processed. Please get in touch with the developer of
          this Safe App for more information.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => handleTxRejection()}>Cancel</Button>
        <Button onClick={() => {}}>Submit</Button>
      </DialogActions>
    </div>
  )
}
