import type { ReactElement, BaseSyntheticEvent } from 'react'
import { Box, Button, DialogActions, DialogContent } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'

import AddressInput from '@/components/common/AddressInput'
import ModalDialog from '@/components/common/ModalDialog'
import NameInput from '@/components/common/NameInput'
import useChainId from '@/hooks/useChainId'
import { useAppDispatch } from '@/store'
import madProps from '@/utils/mad-props'
import { upsertAddressBookEntries } from '@/store/addressBookSlice'

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
  chainIds,
  currentChainId,
}: {
  handleClose: () => void
  defaultValues?: AddressEntry
  disableAddressInput?: boolean
  chainIds?: string[]
  currentChainId: string
}): ReactElement {
  const dispatch = useAppDispatch()

  const methods = useForm<AddressEntry>({
    defaultValues,
    mode: 'onChange',
  })

  const { handleSubmit, formState } = methods

  const submitCallback = handleSubmit((data: AddressEntry) => {
    dispatch(upsertAddressBookEntries({ ...data, chainIds: chainIds ?? [currentChainId] }))
    handleClose()
  })

  const onSubmit = (e: BaseSyntheticEvent) => {
    e.stopPropagation()
    submitCallback(e)
  }

  return (
    <ModalDialog
      open
      onClose={handleClose}
      dialogTitle={defaultValues.name ? 'Edit entry' : 'Create entry'}
      hideChainIndicator={chainIds && chainIds.length > 1}
    >
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <DialogContent>
            <Box mb={2}>
              <NameInput data-testid="name-input" label="Name" autoFocus name="name" required />
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
            <Button data-testid="cancel-btn" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              data-testid="save-btn"
              type="submit"
              variant="contained"
              disabled={!formState.isValid}
              disableElevation
            >
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
