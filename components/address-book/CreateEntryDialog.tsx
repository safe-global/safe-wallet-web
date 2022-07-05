import { FormProvider, useForm } from 'react-hook-form'
import Box from '@mui/material/Box'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import { isAddress } from '@ethersproject/address'
import type { ReactElement } from 'react'

import ModalDialog from '@/components/common/ModalDialog'
import AddressInput from '../common/AddressInput'
import { parsePrefixedAddress } from '@/utils/addresses'
import { useCurrentChain } from '@/hooks/useChains'
import { useAppDispatch } from '@/store'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'

type Entry = {
  name: string
  address: string
}

const CreateEntryDialog = ({ handleClose }: { handleClose: () => void }): ReactElement => {
  const dispatch = useAppDispatch()
  const chain = useCurrentChain()

  const methods = useForm<Entry>({
    defaultValues: {
      name: '',
      address: '',
    },
    mode: 'onChange',
  })
  const { register, handleSubmit, formState } = methods

  const onSubmit = (data: Entry) => {
    if (!chain?.chainId) {
      return
    }

    const { address } = parsePrefixedAddress(data.address)

    if (!isAddress) {
      // TODO: Show error
      return
    }

    dispatch(upsertAddressBookEntry({ chainId: chain.chainId, name: data.name, address }))

    handleClose()
  }

  return (
    <ModalDialog open onClose={handleClose} title="Create entry">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box py={2}>
              <TextField
                autoFocus
                label="Name"
                variant="outlined"
                fullWidth
                {...register('name', { required: true })}
                required
              />
            </Box>

            <Box py={2}>
              <AddressInput name="address" label="Address" variant="outlined" fullWidth required />
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

export default CreateEntryDialog
