import { ReactElement, useEffect } from 'react'
import { InputAdornment, TextField, type TextFieldProps, CircularProgress } from '@mui/material'
import { useFormContext, type Validate } from 'react-hook-form'
import { validatePrefixedAddress } from '@/utils/validation'
import { useCurrentChain } from '@/hooks/useChains'
import useNameResolver from './useNameResolver'

export type AddressInputProps = TextFieldProps & { name: string; validate?: Validate<string> }

const AddressInput = ({ name, validate, ...props }: AddressInputProps): ReactElement => {
  const {
    register,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useFormContext()
  const currentChain = useCurrentChain()
  const currentValue = watch(name)?.trim()

  // Fetch an ENS resolution for the current address
  const { address, resolving } = useNameResolver(currentValue)

  // Update the input value with the resolved ENS name
  useEffect(() => {
    if (address) {
      setValue(name, address, { shouldValidate: true })
    }
  }, [address, name, setValue, trigger])

  return (
    <TextField
      {...props}
      autoComplete="off"
      label={errors[name]?.message || props.label}
      error={!!errors[name]}
      InputProps={{
        ...(props.InputProps || {}),
        endAdornment: resolving && (
          <InputAdornment position="end">
            <CircularProgress size={20} />
          </InputAdornment>
        ),
      }}
      {...register(name, {
        required: true,

        validate: (val: string) => validatePrefixedAddress(currentChain?.shortName)(val) || validate?.(val),
      })}
    />
  )
}

export default AddressInput
