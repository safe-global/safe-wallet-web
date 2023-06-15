import type { ReactElement } from 'react'
import { useEffect, useCallback, useRef, useMemo, useState } from 'react'
import { InputAdornment, TextField, type TextFieldProps, CircularProgress, IconButton, SvgIcon } from '@mui/material'
import { useFormContext, useWatch, type Validate, get } from 'react-hook-form'
import { validatePrefixedAddress } from '@/utils/validation'
import { useCurrentChain } from '@/hooks/useChains'
import useNameResolver from './useNameResolver'
import ScanQRButton from '../ScanQRModal/ScanQRButton'
import { FEATURES, hasFeature } from '@/utils/chains'
import { cleanInputValue, parsePrefixedAddress } from '@/utils/addresses'
import useDebounce from '@/hooks/useDebounce'
import CaretDownIcon from '@/public/images/common/caret-down.svg'
import SaveAddressIcon from '@/public/images/common/save-address.svg'
import EntryDialog from '@/components/address-book/EntryDialog'

export type AddressInputProps = TextFieldProps & {
  name: string
  address?: string
  canAdd?: boolean
  validate?: Validate<string>
  deps?: string | string[]
}

const AddressInput = ({ name, validate, required = true, deps, ...props }: AddressInputProps): ReactElement => {
  const {
    register,
    setValue,
    control,
    formState: { errors },
    trigger,
  } = useFormContext()
  const currentChain = useCurrentChain()
  const rawValueRef = useRef<string>('')
  const watchedValue = useWatch({ name, control })
  const currentShortName = currentChain?.shortName || ''
  const [isValidating, setIsValidating] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)

  // Fetch an ENS resolution for the current address
  const isDomainLookupEnabled = !!currentChain && hasFeature(currentChain, FEATURES.DOMAIN_LOOKUP)
  const { address, resolverError, resolving } = useNameResolver(isDomainLookupEnabled ? watchedValue : '')

  // errors[name] doesn't work with nested field names like 'safe.address', need to use the lodash get
  const fieldError = resolverError || get(errors, name)

  // Debounce the field error unless there's no error or it's resolving a domain
  let error = useDebounce(fieldError, 500)
  if (resolverError) error = resolverError
  if (!fieldError || resolving) error = undefined

  // Validation function based on the current chain prefix
  const validatePrefixed = useMemo(() => validatePrefixedAddress(currentShortName), [currentShortName])

  // Update the input value
  const setAddressValue = useCallback(
    (value: string) => setValue(name, value, { shouldValidate: true }),
    [setValue, name],
  )

  // On ENS resolution, update the input value
  useEffect(() => {
    if (address) {
      setAddressValue(`${currentShortName}:${address}`)
    }
  }, [address, currentShortName, setAddressValue])

  const endAdornment = (
    <InputAdornment position="end">
      {resolving || isValidating ? (
        <CircularProgress size={20} />
      ) : !props.disabled ? (
        <>
          <IconButton onClick={() => setOpen(true)}>
            <SvgIcon component={SaveAddressIcon} inheritViewBox fontSize="small" />
          </IconButton>
          <ScanQRButton onScan={setAddressValue} />
          <IconButton>
            <SvgIcon component={CaretDownIcon} inheritViewBox fontSize="small" />
          </IconButton>
        </>
      ) : null}
    </InputAdornment>
  )

  return (
    <>
      <TextField
        {...props}
        autoComplete="off"
        label={<>{error?.message || props.label}</>}
        error={!!error}
        fullWidth
        spellCheck={false}
        InputProps={{
          ...(props.InputProps || {}),

          // Display the current short name in the adornment, unless the value contains the same prefix
          startAdornment: !error && !rawValueRef.current.startsWith(`${currentShortName}:`) && (
            <InputAdornment position="end">{currentShortName}:</InputAdornment>
          ),

          endAdornment,
        }}
        InputLabelProps={{
          ...(props.InputLabelProps || {}),
          shrink: !!watchedValue || props.focused,
        }}
        {...register(name, {
          deps,

          required,

          setValueAs: (value: string): string => {
            // Clean the input value
            const cleanValue = cleanInputValue(value)
            rawValueRef.current = cleanValue
            // This also checksums the address
            return parsePrefixedAddress(cleanValue).address
          },

          validate: async () => {
            const value = rawValueRef.current
            if (value) {
              setIsValidating(true)
              const result = validatePrefixed(value) || (await validate?.(parsePrefixedAddress(value).address))
              setIsValidating(false)
              return result
            }
          },

          // Workaround for a bug in react-hook-form that it restores a cached error state on blur
          onBlur: () => setTimeout(() => trigger(name), 100),
        })}
        // Workaround for a bug in react-hook-form when `register().value` is cached after `setValueAs`
        // Only seems to occur on the `/load` route
        value={watchedValue}
        sx={{
          backgroundColor: (theme) => theme.palette.background.paper,
          borderRadius: ({ shape }) => `${shape.borderRadius}px`,
        }}
      />
      {open && <EntryDialog handleClose={() => setOpen(false)} defaultValues={{ name: '', address: watchedValue }} />}
    </>
  )
}

export default AddressInput
