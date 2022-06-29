import EthHashInfo from '@/components/common/EthHashInfo'
import { useAppDispatch } from '@/store'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { Box, Button, DialogActions, DialogContent, FormControl, IconButton, TextField, Tooltip } from '@mui/material'
import { ChangeEvent, SyntheticEvent, useState } from 'react'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ModalDialog from '@/components/common/ModalDialog'

export const EditOwnerDialog = ({ chainId, address, name }: { chainId: string; address: string; name?: string }) => {
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState(name ?? '')

  const dispatch = useAppDispatch()

  const handleClose = () => setOpen(false)

  const onNameChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setNewName(event.target.value)
  }

  const onSubmit = (e: SyntheticEvent) => {
    e.preventDefault()

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
    <>
      <Tooltip title="Edit owner">
        <IconButton onClick={() => setOpen(true)}>
          <EditOutlinedIcon />
        </IconButton>
      </Tooltip>

      <ModalDialog open={open} onClose={handleClose} title="Edit owner name">
        <form onSubmit={onSubmit}>
          <DialogContent>
            <Box py={2}>
              <FormControl>
                <TextField
                  autoFocus
                  id="ownerName"
                  label="Owner name"
                  variant="outlined"
                  value={newName}
                  fullWidth
                  onChange={onNameChange}
                />
              </FormControl>
            </Box>

            <Box py={2}>
              <EthHashInfo address={address} showCopyButton shortAddress={false} />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </ModalDialog>
    </>
  )
}
