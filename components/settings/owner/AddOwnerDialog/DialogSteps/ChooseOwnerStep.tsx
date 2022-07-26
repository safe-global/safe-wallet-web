import { useForm, FormProvider } from 'react-hook-form'
import { TextField, Button, Typography, FormControl, Box } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import AddressBookInput from '@/components/common/AddressBookInput'
import { ChangeOwnerData } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/types'
import useSafeInfo from '@/hooks/useSafeInfo'
import { uniqueAddress, addressIsNotCurrentSafe } from '@/utils/validation'
import TxModalTitle from '@/components/tx/TxModalTitle'
import { parsePrefixedAddress } from '@/utils/addresses'

type ChooseOwnerFormData = {
  ownerName?: string
  ownerAddress: string
}

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

  const formData: ChooseOwnerFormData = {
    ownerAddress: newOwner?.address,
    ownerName: newOwner?.name,
  }

  const formMethods = useForm<ChooseOwnerFormData>({
    defaultValues: formData,
    mode: 'onChange',
  })
  const { register, handleSubmit, formState } = formMethods

  const onSubmitHandler = (formData: ChooseOwnerFormData) => {
    onSubmit({
      ...data,
      newOwner: {
        address: parsePrefixedAddress(formData.ownerAddress).address,
        name: formData.ownerName,
      },
    })
  }

  const notAlreadyOwner = uniqueAddress(owners?.map((owner) => owner.value))
  const notCurrentSafe = addressIsNotCurrentSafe(safeAddress)
  const combinedValidate = (address: string) => notAlreadyOwner(address) || notCurrentSafe(address)

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <TxModalTitle>Add new owner</TxModalTitle>

        <Box mt={4} mb={1}>
          {isReplace
            ? 'Review the owner you want to replace in the active Safe, then specify the new owner you want to replace it with:'
            : 'Add a new owner to the active Safe.'}
        </Box>

        {removedOwner && (
          <Box my={2}>
            <Typography mb={1}>Current owner</Typography>
            <EthHashInfo address={removedOwner.address} showCopyButton shortAddress={false} />
          </Box>
        )}

        <Box display="flex" flexDirection="column" gap={2} paddingTop={2}>
          <FormControl>
            <TextField
              label="Owner name"
              variant="outlined"
              error={Boolean(formState.errors.ownerName)}
              helperText={
                formState.errors.ownerName?.type === 'maxLength'
                  ? 'Should be 1 to 50 symbols'
                  : formState.errors.ownerName?.message
              }
              fullWidth
              {...register('ownerName', { maxLength: 50 })}
            />
          </FormControl>

          <FormControl>
            <AddressBookInput name="ownerAddress" label="Owner address" validate={combinedValidate} />
          </FormControl>
        </Box>

        <Button variant="contained" type="submit" disabled={!formState.isValid}>
          Next
        </Button>
      </form>
    </FormProvider>
  )
}
