import { ReactElement } from 'react'
import { useFormContext } from 'react-hook-form'
import { Autocomplete, Box, createFilterOptions } from '@mui/material'
import useAddressBook from '@/hooks/useAddressBook'
import AddressInput, { type AddressInputProps } from '../AddressInput'

const abFilterOptions = createFilterOptions({
  stringify: (option: { label: string; name: string }) => option.name + ' ' + option.label,
})

/**
 *  Temporary component until revamped safe components are done
 */
const AddressBookInput = ({ name, ...props }: AddressInputProps): ReactElement => {
  const addressBook = useAddressBook()
  const { getValues } = useFormContext()

  const addressBookEntries = Object.entries(addressBook).map(([address, name]) => ({
    label: address,
    name,
  }))

  return (
    <Autocomplete
      value={getValues(name)?.toString() || ''}
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
      renderInput={(params) => <AddressInput {...params} {...props} name={name} />}
    />
  )
}

export default AddressBookInput
