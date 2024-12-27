import AddSafeInput from '@/features/bundle/AddSafeInput'
import { createBundleLink } from '@/features/bundle/utils'
import { useRouter } from 'next/router'
import { type BaseSyntheticEvent, useState } from 'react'
import ModalDialog from '@/components/common/ModalDialog'
import NameInput from '@/components/common/NameInput'
import { addBundle } from '@/features/bundle/bundleSlice'
import { useAppDispatch } from '@/store'
import { Box, Button, DialogActions, DialogContent } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'

export type SafeEntry = {
  address: string
  chainId: string
}

export type BundleEntry = {
  name: string
  safes: SafeEntry[]
}

const CreateBundle = () => {
  const [open, setOpen] = useState<boolean>(false)
  const dispatch = useAppDispatch()
  const router = useRouter()

  const methods = useForm<BundleEntry>({
    mode: 'onChange',
  })

  const { handleSubmit, reset } = methods

  const submitCallback = handleSubmit((data: BundleEntry) => {
    dispatch(addBundle({ name: data.name, safes: data.safes }))
    reset()
    setOpen(false)
    router.push(createBundleLink(data))
  })

  const onSubmit = (e: BaseSyntheticEvent) => {
    e.stopPropagation()
    submitCallback(e)
  }
  return (
    <>
      <Button size="small" variant="contained" onClick={() => setOpen(true)}>
        Create Bundle
      </Button>

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
    </>
  )
}

export default CreateBundle
