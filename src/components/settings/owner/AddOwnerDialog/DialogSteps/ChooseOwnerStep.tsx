import AddressBookInput from '@/components/common/AddressBookInput'
import EthHashInfo from '@/components/common/EthHashInfo'
import NameInput from '@/components/common/NameInput'
import { ChangeOwnerData, OwnerData } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/types'
import useSafeInfo from '@/hooks/useSafeInfo'
import { addressIsNotCurrentSafe, uniqueAddress } from '@/utils/validation'
import { Box, Button, CircularProgress, DialogContent, FormControl, InputAdornment, Typography } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { useAddressResolver } from '@/hooks/useAddressResolver'
import React, { useEffect } from 'react'
import { useMnemonicName } from '@/hooks/useMnemonicName'

export const ChooseOwnerStep = ({
  data,
  onSubmit,
}: {
  data: ChangeOwnerData
  onSubmit: (data: ChangeOwnerData) => void
}) => {
  const fallbackName = useMnemonicName()
  const { safe, safeAddress } = useSafeInfo()
  const { removedOwner, newOwner } = data
  const owners = safe.owners

  const isReplace = Boolean(removedOwner)

  const defaultValues: OwnerData = {
    address: newOwner?.address,
    name: newOwner?.name || fallbackName,
  }

  const formMethods = useForm<OwnerData>({
    defaultValues,
    mode: 'onChange',
  })
  const { handleSubmit, formState, watch, setValue } = formMethods

  const onSubmitHandler = (formData: OwnerData) => {
    onSubmit({
      ...data,
      newOwner: formData,
    })
  }

  const notAlreadyOwner = uniqueAddress(owners?.map((owner) => owner.value))
  const notCurrentSafe = addressIsNotCurrentSafe(safeAddress)
  const combinedValidate = (address: string) => notAlreadyOwner(address) || notCurrentSafe(address)

  const address = watch('address')

  const { name, resolving } = useAddressResolver(address)

  useEffect(() => {
    name && setValue(`name`, name)
  }, [name, setValue])

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
              <NameInput
                label="Owner name"
                name="name"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: resolving && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ),
                }}
                required
              />
            </FormControl>

            <FormControl>
              <AddressBookInput name="address" label="Owner address" validate={combinedValidate} />
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
