import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import type { ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

import AddressInput from '@/components/common/AddressInput'
import ModalDialog from '@/components/common/ModalDialog'
import NameInput from '@/components/common/NameInput'
import useChainId from '@/hooks/useChainId'
import { useAppDispatch } from '@/store'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { parsePrefixedAddress } from '@/utils/addresses'

export type AddressEntry = {
  name: string
  address: string
}

const EntryDialog = ({
  handleClose,
  defaultValues = {
    name: '',
    address: '',
  },
  disableAddressInput = false,
}: {
  handleClose: () => void
  defaultValues?: AddressEntry
  disableAddressInput?: boolean
}): ReactElement => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()

  const methods = useForm<AddressEntry>({
    defaultValues,
    mode: 'onChange',
  })
  const { handleSubmit, formState } = methods

  const onSubmit = (data: AddressEntry) => {
    const { address } = parsePrefixedAddress(data.address)

    dispatch(upsertAddressBookEntry({ chainId, name: data.name, address }))

    handleClose()
  }

  return (
    <ModalDialog open onClose={handleClose} dialogTitle={defaultValues.name ? 'Edit entry' : 'Create entry'}>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box mb={2}>
              <NameInput label="Name" autoFocus name="name" required />
            </Box>

            <Box>
              <AddressInput
                name="address"
                label="Address"
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

export default EntryDialog
