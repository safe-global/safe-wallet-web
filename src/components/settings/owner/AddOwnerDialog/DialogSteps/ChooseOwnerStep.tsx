import AddressBookInput from '@/components/common/AddressBookInput'
import EthHashInfo from '@/components/common/EthHashInfo'
import NameInput from '@/components/common/NameInput'
import type { ChangeOwnerData, OwnerData } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/types'
import useSafeInfo from '@/hooks/useSafeInfo'
import { addressIsNotCurrentSafe, uniqueAddress } from '@/utils/validation'
import { Box, Button, CircularProgress, DialogContent, FormControl, InputAdornment, Typography } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { useAddressResolver } from '@/hooks/useAddressResolver'

export const ChooseOwnerStep = ({
  data,
  onSubmit,
}: {
  data: ChangeOwnerData
  onSubmit: (data: ChangeOwnerData) => void
}) => {
  const { safe, safeAddress } = useSafeInfo()
  const { removedOwner, newOwner } = data
  const owners = safe.owners

  const isReplace = Boolean(removedOwner)

  const defaultValues: OwnerData = {
    address: newOwner?.address,
    name: newOwner?.name,
  }

  const formMethods = useForm<OwnerData>({
    defaultValues,
    mode: 'onChange',
  })
  const { handleSubmit, formState, watch } = formMethods
  const isValid = Object.keys(formState.errors).length === 0 // do not use formState.isValid because names can be empty

  const notAlreadyOwner = uniqueAddress(owners?.map((owner) => owner.value))
  const notCurrentSafe = addressIsNotCurrentSafe(safeAddress)
  const combinedValidate = (address: string) => notAlreadyOwner(address) || notCurrentSafe(address)

  const address = watch('address')

  const { name, ens, resolving } = useAddressResolver(address)

  // Address book, ENS
  const fallbackName = name || ens

  const onFormSubmit = handleSubmit((formData: OwnerData) => {
    onSubmit({
      ...data,
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
            {isReplace
              ? 'Review the owner you want to replace in the active Safe Account, then specify the new owner you want to replace it with:'
              : 'Add a new owner to the active Safe Account.'}
          </Box>

          {removedOwner && (
            <Box my={2}>
              <Typography mb={1}>Current owner</Typography>
              <EthHashInfo address={removedOwner.address} showCopyButton shortAddress={false} hasExplorer />
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

          <Button variant="contained" type="submit" disabled={!isValid || resolving}>
            Next
          </Button>
        </DialogContent>
      </form>
    </FormProvider>
  )
}
