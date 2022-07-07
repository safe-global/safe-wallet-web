import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import type { ReactElement } from 'react'

import ModalDialog from '@/components/common/ModalDialog'
import { useAppDispatch } from '@/store'
import useChainId from '@/hooks/useChainId'
import useAddressBook from '@/hooks/useAddressBook'
import { removeSafe } from '@/store/addedSafesSlice'

const SafeListRemoveDialog = ({ handleClose, address }: { handleClose: () => void; address: string }): ReactElement => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()
  const addressBook = useAddressBook()

  const safe = addressBook?.[address] || address

  const handleConfirm = () => {
    dispatch(removeSafe({ chainId, address }))
    handleClose()
  }

  return (
    <ModalDialog open onClose={handleClose} title="Delete entry">
      <DialogContent sx={{ p: '24px !important' }}>
        <Typography>
          Are you sure you want to remove <b>{safe}</b> from your list of added Safes?
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disableElevation
          sx={({ palette }) => ({ backgroundColor: palette.error.main })}
        >
          Delete
        </Button>
      </DialogActions>
    </ModalDialog>
  )
}

export default SafeListRemoveDialog
