import { AddressInfo } from '@/components/common/AddressInfo'
import { useAppDispatch } from '@/store'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, TextField } from '@mui/material'
import { ChangeEvent, useState } from 'react'
import css from './styles.module.css'

export const EditOwnerDialog = ({
  chainId,
  address,
  name,
}: {
  chainId: string
  address: string
  name: string | null
}) => {
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState(name ?? '')

  const dispatch = useAppDispatch()

  const handleClose = () => setOpen(false)

  const onNameChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setNewName(event.target.value)
  }

  const submit = () => {
    if (newName !== name) {
      dispatch(
        upsertAddressBookEntry({
          chainId: chainId,
          address: address,
          name: newName,
        }),
      )
      handleClose()
    }
  }

  return (
    <div>
      <Button variant="text" onClick={() => setOpen(true)}>
        Edit
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit owner name</DialogTitle>
        <DialogContent>
          <div className={css.content}>
            <TextField
              autoFocus
              id="ownerName"
              label="Owner name"
              variant="outlined"
              value={newName}
              fullWidth
              onChange={onNameChange}
            />
            <AddressInfo address={address} copyToClipboard />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={submit}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
