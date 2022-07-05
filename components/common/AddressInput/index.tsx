import { ReactElement } from 'react'
import { TextField, type TextFieldProps } from '@mui/material'
import { useFormContext, type Validate } from 'react-hook-form'
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

        validate: (val: string) => {
          return validatePrefixedAddress(currentChain?.shortName)(val) || validate?.(val)
        },
      })}
    />
  )
}

export default AddressInput
