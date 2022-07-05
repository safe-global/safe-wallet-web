import { ReactElement, useEffect } from 'react'
import { InputAdornment, TextField, type TextFieldProps } from '@mui/material'
import { useFormContext, type Validate } from 'react-hook-form'
import { validatePrefixedAddress } from '@/utils/validation'
import { useCurrentChain } from '@/hooks/useChains'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import useAsync from '@/hooks/useAsync'
import { resolveName } from '@/services/domains'
import RefreshSpinner from '@/components/common/RefreshSpinner'

export type AddressInputProps = TextFieldProps & { name: string; validate?: Validate<string> }

const AddressInput = ({ name, validate, ...props }: AddressInputProps): ReactElement => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext()
  const currentChain = useCurrentChain()
  const ethersProvider = useWeb3ReadOnly()
  const currentValue = watch(name)?.trim()

  // Fetch an ENS resolution for the current address
  const [ens, , ensResolving] = useAsync<{ name: string; address: string } | undefined>(async () => {
    if (!ethersProvider) return
    const address = await resolveName(ethersProvider, currentValue)
    return address ? { address, name: currentValue } : undefined
  }, [currentValue, ethersProvider])

  // Update the input value with the resolved ENS name
  useEffect(() => {
    if (ens && ens.name === currentValue && currentValue !== ens.address) {
      setValue(name, ens.address)
    }
  }, [name, currentValue, ens, setValue])

  return (
    <TextField
      {...props}
      autoComplete="off"
      label={errors[name]?.message || props.label}
      error={!!errors[name]}
      InputProps={{
        endAdornment: ensResolving && (
          <InputAdornment position="end">
            <RefreshSpinner />
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
