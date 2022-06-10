import { validateAddress } from '@/services/validation'
import { TextField } from '@mui/material'
import { ChangeEvent, useState } from 'react'

/**
 *  Temporary component until revamped safe components are done
 */
export const AddressInput = ({
  address,
  onAddressChange,
  name,
  label,
  validators,
}: {
  address: string
  onAddressChange: (address: string) => void
  name: string
  label: string
  validators?: ((address: string) => string | undefined)[]
}) => {
  const [validationError, setValidationError] = useState<string | undefined>(undefined)
  const [inputAddress, setInputAddress] = useState(address)
  const combineValidators: ((address: string) => string | undefined)[] = [validateAddress, ...(validators ?? [])]
  const onChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newAddress = event.target.value
    setValidationError(validate(newAddress))
    setInputAddress(newAddress)
    onAddressChange(newAddress)
  }

  const validate = (address: string) => {
    return combineValidators
      .map((validator) => validator(address))
      .filter(Boolean)
      .find(() => true)
  }

  return (
    <TextField
      autoFocus
      id="ownerName"
      label={label}
      variant="outlined"
      value={address}
      fullWidth
      onChange={onChange}
      error={Boolean(validationError)}
      helperText={validationError}
    />
  )
}
