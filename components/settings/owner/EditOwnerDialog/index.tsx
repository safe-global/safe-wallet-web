import EthHashInfo from '@/components/common/EthHashInfo'
import { useAppDispatch } from '@/store'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { Box, Button, DialogActions, DialogContent, IconButton, TextField, Tooltip } from '@mui/material'
import { useState } from 'react'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ModalDialog from '@/components/common/ModalDialog'
import { useForm } from 'react-hook-form'

type EditOwnerValues = {
  name: string
}

export const EditOwnerDialog = ({ chainId, address, name }: { chainId: string; address: string; name?: string }) => {
  const [open, setOpen] = useState(false)

  const dispatch = useAppDispatch()

  const handleClose = () => setOpen(false)

  const onSubmit = (data: EditOwnerValues) => {
    if (data.name !== name) {
      dispatch(
        upsertAddressBookEntry({
          chainId: chainId,
          address: address,
          name: data.name,
        }),
      )
      handleClose()
    }
  }

  const { handleSubmit, formState, register } = useForm<EditOwnerValues>({
    defaultValues: {
      name: name || '',
    },
    mode: 'onChange',
  })

  return (
    <>
      <Tooltip title="Edit owner">
        <IconButton onClick={() => setOpen(true)}>
          <EditOutlinedIcon />
        </IconButton>
      </Tooltip>

      <ModalDialog open={open} onClose={handleClose} title="Edit owner name">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box py={2}>
              <TextField
                label="Owner name"
                variant="outlined"
                fullWidth
                error={Boolean(formState.errors.name)}
                helperText={
                  formState.errors.name?.type === 'maxLength'
                    ? 'Should be 1 to 50 symbols'
                    : formState.errors.name?.message
                }
                {...register('name', { required: true, maxLength: 50 })}
              />
            </Box>

            <Box py={2}>
              <EthHashInfo address={address} showCopyButton shortAddress={false} />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!formState.isValid}>
              Save
            </Button>
          </DialogActions>
        </form>
      </ModalDialog>
    </>
  )
}
