import useAddressBook from '@/hooks/useAddressBook'
import { Autocomplete, Box, createFilterOptions, TextField } from '@mui/material'
import { FieldError, UseFormRegisterReturn } from 'react-hook-form'

const abFilterOptions = createFilterOptions({
  stringify: (option: { label: string; name: string }) => option.name + ' ' + option.label,
})

/**
 *  Temporary component until revamped safe components are done
 */
export const AddressInput = ({
  defaultValue,
  error,
  label,
  textFieldProps,
}: {
  defaultValue?: string
  error: FieldError | undefined
  label: string
  textFieldProps: UseFormRegisterReturn
}) => {
  const addressBook = useAddressBook()

  const addressBookEntries = Object.entries(addressBook).map(([address, name]) => ({
    label: address,
    name,
  }))

  return (
    <Autocomplete
      defaultValue={defaultValue}
      freeSolo
      disablePortal
      options={addressBookEntries}
      filterOptions={abFilterOptions}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          {option.name}
          <br />
          {option.label}
        </Box>
      )}
      renderInput={(params) => (
        <TextField {...params} autoComplete="off" label={error?.message || label} error={!!error} {...textFieldProps} />
      )}
    />
  )
}
