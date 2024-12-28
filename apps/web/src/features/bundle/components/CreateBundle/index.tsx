import type { BaseSyntheticEvent, Dispatch, SetStateAction } from 'react'
import AddSafeInput from '@/features/bundle/AddSafeInput'
import ModalDialog from '@/components/common/ModalDialog'
import NameInput from '@/components/common/NameInput'
import { addBundle, type Bundle } from '@/features/bundle/bundleSlice'
import { useAppDispatch } from '@/store'
import { Box, Button, DialogActions, DialogContent } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'

const CreateBundle = ({
  open,
  setOpen,
  bundle,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  bundle?: Bundle
}) => {
  const dispatch = useAppDispatch()

  const methods = useForm<Bundle>({
    mode: 'onChange',
    defaultValues: {
      id: bundle?.id,
      name: bundle?.name,
      safes: bundle?.safes,
    },
  })

  const { handleSubmit, reset } = methods

  const submitCallback = handleSubmit((data: Bundle) => {
    const id = data.id || crypto.randomUUID()
    dispatch(addBundle({ id, name: data.name, safes: data.safes }))
    reset()
    setOpen(false)
  })

  const onSubmit = (e: BaseSyntheticEvent) => {
    e.stopPropagation()
    submitCallback(e)
  }
  return (
    <ModalDialog open={open} dialogTitle="Create Bundle" hideChainIndicator onClose={() => setOpen(false)}>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <DialogContent>
            <Box mb={2}>
              <NameInput label="Bundle name" autoFocus name="name" required />
            </Box>
            <Box>
              <AddSafeInput name="safes" />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" type="submit">
              Submit
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </ModalDialog>
  )
}

export default CreateBundle
