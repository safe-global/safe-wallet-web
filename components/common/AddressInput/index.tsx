import { ReactElement } from 'react'
import { TextField, type TextFieldProps } from '@mui/material'
import { useFormContext, type Validate } from 'react-hook-form'
import { parsePrefixedAddress, PrefixedAddress } from '@/utils/addresses'
import { validatePrefixedAddress } from '@/utils/validation'
import { useCurrentChain } from '@/hooks/useChains'

export type AddressInputProps = TextFieldProps & { name: string; validate?: Validate<string> }

const AddressInput = ({ name, validate, ...props }: AddressInputProps): ReactElement => {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  const currentChain = useCurrentChain()

  return (
    <TextField
      {...props}
      autoComplete="off"
      label={errors[name]?.message || props.label}
      error={!!errors[name]}
      {...register(name, {
        required: true,

        setValueAs: (value: string | PrefixedAddress): PrefixedAddress & { toString: () => string } => {
          if (typeof value !== 'string') return value
          const { address, prefix = currentChain?.shortName } = parsePrefixedAddress(value)
          return { address, prefix, toString: () => value }
        },

        validate: (val: PrefixedAddress) => {
          return validatePrefixedAddress(currentChain?.shortName)(val.toString()) || validate?.(val.address)
        },
      })}
    />
  )
}

export default AddressInput
