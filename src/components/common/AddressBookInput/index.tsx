import type { ReactElement } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Typography } from '@mui/material'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import useAddressBook from '@/hooks/useAddressBook'
import AddressInput, { type AddressInputProps } from '../AddressInput'
import EthHashInfo from '../EthHashInfo'

const abFilterOptions = createFilterOptions({
  stringify: (option: { label: string; name: string }) => option.name + ' ' + option.label,
})

/**
 *  Temporary component until revamped safe components are done
 */
const AddressBookInput = ({ name, ...props }: AddressInputProps): ReactElement => {
  const addressBook = useAddressBook()
  const { setValue, control } = useFormContext()
  const addressValue = useWatch({ name, control })

  const addressBookEntries = Object.entries(addressBook).map(([address, name]) => ({
    label: address,
    name,
  }))

  return (
    <Autocomplete
      value={addressValue || ''}
      disabled={props.disabled}
      readOnly={props.InputProps?.readOnly}
      freeSolo
      options={addressBookEntries}
      onInputChange={(_, value) => setValue(name, value, { shouldValidate: true })}
      filterOptions={abFilterOptions}
      componentsProps={{
        paper: {
          elevation: 2,
        },
      }}
      renderOption={(props, option) => (
        <Typography component="li" variant="body2" {...props}>
          <EthHashInfo address={option.label} name={option.name} shortAddress={false} />
        </Typography>
      )}
      renderInput={(params) => <AddressInput {...params} {...props} name={name} />}
    />
  )
}

export default AddressBookInput
