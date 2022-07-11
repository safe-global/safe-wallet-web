import ModalDialog from '@/components/common/ModalDialog'
import { DialogActions, DialogContent, Typography } from '@mui/material'
import ChainIndicator from '@/components/common/ChainIndicator'
import Button from '@mui/material/Button'
import { useRouter } from 'next/router'
import { useState } from 'react'

export const NewSafeModal = () => {
  const [open, setOpen] = useState<boolean>(true)
  const router = useRouter()

  const handleClose = () => {
    setOpen(false)
  }

  return router.query.new ? (
    <ModalDialog open={open} onClose={handleClose}>
      <DialogContent>
        <Typography>
          You just created a new Safe on <ChainIndicator inline />
        </Typography>
        <Typography>It can take a few minutes until its fully usable.</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleClose}>
          Ok
        </Button>
      </DialogActions>
    </ModalDialog>
  ) : null
}
