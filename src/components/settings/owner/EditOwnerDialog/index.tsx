import EthHashInfo from '@/components/common/EthHashInfo'
import ModalDialog from '@/components/common/ModalDialog'
import NameInput from '@/components/common/NameInput'
import Track from '@/components/common/Track'
import EditIcon from '@/public/images/common/edit.svg'
import { SETTINGS_EVENTS } from '@/services/analytics/events/settings'
import { useAppDispatch } from '@/store'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { Box, Button, DialogActions, DialogContent, IconButton, SvgIcon, Tooltip } from '@mui/material'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

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

  const formMethods = useForm<EditOwnerValues>({
    defaultValues: {
      name: name || '',
    },
    mode: 'onChange',
  })

  const { handleSubmit, formState, watch } = formMethods

  const nameValue = watch('name')

  const buttonDisabled = !formState.isValid || nameValue === name || nameValue === ''

  return (
    <>
      <Track {...SETTINGS_EVENTS.SETUP.EDIT_OWNER}>
        <Tooltip title="Edit owner">
          <span>
            <IconButton onClick={() => setOpen(true)} size="small">
              <SvgIcon component={EditIcon} inheritViewBox color="border" fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Track>

      <ModalDialog open={open} onClose={handleClose} dialogTitle="Edit owner name">
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <Box data-sid="87481" py={2}>
                <NameInput label="Owner name" name="name" required />
              </Box>

              <Box data-sid="16500" py={2}>
                <EthHashInfo address={address} showCopyButton shortAddress={false} />
              </Box>
            </DialogContent>

            <DialogActions>
              <Button data-sid="25033" onClick={handleClose}>
                Cancel
              </Button>
              <Button data-sid="53452" type="submit" variant="contained" disabled={buttonDisabled}>
                Save
              </Button>
            </DialogActions>
          </form>
        </FormProvider>
      </ModalDialog>
    </>
  )
}
