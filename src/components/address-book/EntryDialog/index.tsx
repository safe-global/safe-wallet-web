import type { ReactElement, BaseSyntheticEvent } from 'react'
import { Box, Button, DialogActions, DialogContent } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'

import AddressInput from '@/components/common/AddressInput'
import ModalDialog from '@/components/common/ModalDialog'
import NameInput from '@/components/common/NameInput'
import useChainId from '@/hooks/useChainId'
import { useAppDispatch } from '@/store'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import madProps from '@/utils/mad-props'

export type AddressEntry = {
  name: string
  address: string
}

function EntryDialog({
  handleClose,
  defaultValues = {
    name: '',
    address: '',
  },
  disableAddressInput = false,
  chainId,
  currentChainId,
}: {
  handleClose: () => void
  defaultValues?: AddressEntry
  disableAddressInput?: boolean
  chainId?: string
  currentChainId: string
}): ReactElement {
  const dispatch = useAppDispatch()

  const methods = useForm<AddressEntry>({
    defaultValues,
    mode: 'onChange',
  })

  const { handleSubmit, formState } = methods

  const submitCallback = handleSubmit((data: AddressEntry) => {
    dispatch(upsertAddressBookEntry({ ...data, chainId: chainId || currentChainId }))
    handleClose()
  })

  const onSubmit = (e: BaseSyntheticEvent) => {
    e.stopPropagation()
    submitCallback(e)
  }

  return (
    <ModalDialog open onClose={handleClose} dialogTitle={defaultValues.name ? 'Edit entry' : 'Create entry'}>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <DialogContent>
            <Box mb={2}>
              <NameInput label="Name" autoFocus name="name" required />
            </Box>

            <Box>
              <AddressInput
                name="address"
                label="Contact"
                variant="outlined"
                fullWidth
                required
                disabled={disableAddressInput}
              />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!formState.isValid} disableElevation>
              Save
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </ModalDialog>
  )
}

export default madProps(EntryDialog, {
  currentChainId: useChainId,
})
