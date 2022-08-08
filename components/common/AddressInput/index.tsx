import { ReactElement, useEffect, useCallback } from 'react'
import { InputAdornment, TextField, type TextFieldProps, CircularProgress, Grid } from '@mui/material'
import { useFormContext, type Validate } from 'react-hook-form'
import { FEATURES } from '@gnosis.pm/safe-react-gateway-sdk'
import { validatePrefixedAddress } from '@/utils/validation'
import { useCurrentChain } from '@/hooks/useChains'
import useNameResolver from './useNameResolver'
import ScanQRButton from '../ScanQRModal/ScanQRButton'
import { hasFeature } from '@/utils/chains'

export type AddressInputProps = TextFieldProps & { name: string; validate?: Validate<string> }

const AddressInput = ({ name, validate, ...props }: AddressInputProps): ReactElement => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext()
  const currentChain = useCurrentChain()
  const isDomainLookupEnabled = !!currentChain && hasFeature(currentChain, FEATURES.DOMAIN_LOOKUP)
  const currentValue = watch(name)

  // Fetch an ENS resolution for the current address
  const { address, resolving } = useNameResolver(isDomainLookupEnabled ? currentValue?.trim() : '')

  const setAddressValue = useCallback(
    (value: string) => {
      setValue(name, value, { shouldValidate: true })
    },
    [setValue, name],
  )

  // Update the input value with the resolved ENS name
  useEffect(() => {
    address && setAddressValue(address)
  }, [address, name, setAddressValue])

  return (
    <Grid container alignItems="center" gap={1}>
      <Grid item flexGrow={1}>
        <TextField
          {...props}
          autoComplete="off"
          label={<>{errors[name]?.message || props.label}</>}
          error={!!errors[name]}
          fullWidth
          InputProps={{
            ...(props.InputProps || {}),
            endAdornment: resolving && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ),
          }}
          InputLabelProps={{
            ...(props.InputLabelProps || {}),
            shrink: !!currentValue || props.focused,
          }}
          {...register(name, {
            required: true,

            validate: (val: string) => validatePrefixedAddress(currentChain?.shortName)(val) || validate?.(val),
          })}
        />
      </Grid>

      {!props.disabled && (
        <Grid item>
          <ScanQRButton onScan={setAddressValue} />
        </Grid>
      )}
    </Grid>
  )
}

export default AddressInput
