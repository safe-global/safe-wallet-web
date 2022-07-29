import AddressBookInput from '@/components/common/AddressBookInput'
import EthHashInfo from '@/components/common/EthHashInfo'
import NameInput from '@/components/common/NameInput'
import { ChangeOwnerData } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/types'
import useSafeInfo from '@/hooks/useSafeInfo'
import { parsePrefixedAddress } from '@/utils/addresses'
import { addressIsNotCurrentSafe, uniqueAddress } from '@/utils/validation'
import { Box, Button, DialogContent, FormControl, Typography } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'

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

  const defaultValues: ChooseOwnerFormData = {
    ownerAddress: newOwner?.address,
    ownerName: newOwner?.name,
  }

  const formMethods = useForm<ChooseOwnerFormData>({
    defaultValues,
    mode: 'onChange',
  })
  const { handleSubmit, formState } = formMethods

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
        <DialogContent>
          <Box mb={1}>
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
              <NameInput textFieldProps={{ label: 'Owner name' }} name="ownerName" />
            </FormControl>

            <FormControl>
              <AddressBookInput name="ownerAddress" label="Owner address" validate={combinedValidate} />
            </FormControl>
          </Box>

          <Button variant="contained" type="submit" disabled={!formState.isValid}>
            Next
          </Button>
        </DialogContent>
      </form>
    </FormProvider>
  )
}
