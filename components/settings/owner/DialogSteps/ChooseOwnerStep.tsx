import EthHashInfo from '@/components/common/EthHashInfo'
import { AddressInput } from '@/components/common/AddressInput'
import { ChangeOwnerData } from '@/components/settings/owner/DialogSteps/data'
import useSafeInfo from '@/hooks/useSafeInfo'
import { uniqueAddress, addressIsNotCurrentSafe, validateAddress } from '@/utils/validation'
import { TextField, Button, Typography, FormControl, Box } from '@mui/material'
import { useForm } from 'react-hook-form'

import css from './styles.module.css'

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
  const { safe } = useSafeInfo()
  const { removedOwner, newOwner } = data
  const owners = safe?.owners

  const isReplace = Boolean(removedOwner)

  const notAlreadyOwner = uniqueAddress(owners?.map((owner) => owner.value))
  const notCurrentSafe = addressIsNotCurrentSafe(safe?.address.value ?? '')

  const formData: ChooseOwnerFormData = { ownerAddress: newOwner.address, ownerName: newOwner.name }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChooseOwnerFormData>({
    defaultValues: formData,
  })

  const onSubmitHandler = (formData: ChooseOwnerFormData) => {
    onSubmit({ ...data, newOwner: { address: formData.ownerAddress, name: formData.ownerName } })
  }

  const combinedValidate = (address: string) =>
    [validateAddress, notAlreadyOwner, notCurrentSafe]
      .map((validate) => validate(address))
      .filter(Boolean)
      .find(() => true)

  return (
    <form className={css.container} onSubmit={handleSubmit(onSubmitHandler)}>
      <p>
        {isReplace
          ? 'Review the owner you want to replace in the active Safe, then specify the new owner you want to replace it with:'
          : 'Add a new owner to the active Safe.'}
      </p>
      {removedOwner && (
        <div>
          <Typography>Current owner</Typography>
          <EthHashInfo address={removedOwner.address} showCopyButton shortAddress={false} />
        </div>
      )}
      <Box display="flex" flexDirection="column" gap={2} paddingTop={2}>
        <Typography>New owner</Typography>
        <FormControl fullWidth>
          <TextField autoFocus label="Owner name" variant="outlined" fullWidth {...register('ownerName')} />
        </FormControl>
        <FormControl fullWidth>
          <AddressInput
            defaultValue={formData.ownerAddress}
            label="Owner address"
            error={errors.ownerAddress}
            textFieldProps={{
              ...register('ownerAddress', {
                required: true,
                validate: { combinedValidate },
              }),
            }}
          />
        </FormControl>
      </Box>
      <div className={css.submit}>
        <Button variant="contained" type="submit">
          Next
        </Button>
      </div>
    </form>
  )
}
