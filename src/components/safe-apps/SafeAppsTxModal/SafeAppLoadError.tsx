import { ReactElement } from 'react'
import { Button, DialogActions, DialogContent, Typography } from '@mui/material'
import { SafeAppsTxParams } from '.'

export const SafeAppLoadError = ({ requestId }: SafeAppsTxParams): ReactElement => {
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
        <Button onClick={() => {}}>Cancel</Button>
        <Button onClick={() => {}}>Submit</Button>
      </DialogActions>
    </div>
  )
}
