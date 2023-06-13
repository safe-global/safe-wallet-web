import { EthHashInfo } from '@safe-global/safe-react-components'
import {
  DialogContent,
  Box,
  Typography,
  FormControl,
  InputAdornment,
  CircularProgress,
  Button,
  DialogActions,
} from '@mui/material'
import { useForm, FormProvider } from 'react-hook-form'

import AddressBookInput from '@/components/common/AddressBookInput'
import NameInput from '@/components/common/NameInput'
import { useAddressResolver } from '@/hooks/useAddressResolver'
import useSafeInfo from '@/hooks/useSafeInfo'
import { uniqueAddress, addressIsNotCurrentSafe } from '@/utils/validation'
import type { AddOwnerFlowProps } from '.'
import type { ReplaceOwnerFlowProps } from '../ReplaceOwner'

type FormData = (AddOwnerFlowProps | ReplaceOwnerFlowProps)['newOwner']

export const ChooseOwner = ({
  params,
  onSubmit,
}: {
  params: AddOwnerFlowProps | ReplaceOwnerFlowProps
  onSubmit: (data: Pick<AddOwnerFlowProps | ReplaceOwnerFlowProps, 'newOwner'>) => void
}) => {
  const { safe, safeAddress } = useSafeInfo()

  const formMethods = useForm<FormData>({
    defaultValues: params.newOwner,
    mode: 'onChange',
  })
  const { handleSubmit, formState, watch } = formMethods
  const isValid = Object.keys(formState.errors).length === 0 // do not use formState.isValid because names can be empty

  const notAlreadyOwner = uniqueAddress(safe.owners.map((owner) => owner.value))
  const notCurrentSafe = addressIsNotCurrentSafe(safeAddress)
  const combinedValidate = (address: string) => notAlreadyOwner(address) || notCurrentSafe(address)

  const address = watch('address')

  const { name, ens, resolving } = useAddressResolver(address)

  // Address book, ENS
  const fallbackName = name || ens

  const onFormSubmit = handleSubmit((formData: FormData) => {
    onSubmit({
      newOwner: {
        ...formData,
        name: formData.name || fallbackName,
      },
    })
  })

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={onFormSubmit}>
        <DialogContent>
          <Box mb={1}>
            {params.removedOwner
              ? 'Review the owner you want to replace in the active Safe Account, then specify the new owner you want to replace it with:'
              : 'Add a new owner to the active Safe Account.'}
          </Box>

          {params.removedOwner && (
            <Box my={2}>
              <Typography mb={1}>Current owner</Typography>
              <EthHashInfo address={params.removedOwner.address} showCopyButton shortAddress={false} hasExplorer />
            </Box>
          )}

          <Box display="flex" flexDirection="column" gap={2} paddingTop={2}>
            <Typography>New owner</Typography>
            <FormControl>
              <NameInput
                label="Owner name"
                name="name"
                placeholder={fallbackName || 'New owner'}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: resolving && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>

            <FormControl>
              <AddressBookInput name="address" label="Owner" validate={combinedValidate} />
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" type="submit" disabled={!isValid || resolving}>
            Next
          </Button>
        </DialogActions>
      </form>
    </FormProvider>
  )
}
