import { CircularProgress, FormControl, Grid, IconButton } from '@mui/material'
import NameInput from '@/components/common/NameInput'
import InputAdornment from '@mui/material/InputAdornment'
import AddressBookInput from '@/components/common/AddressBookInput'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { FieldArrayWithId, UseFieldArrayRemove, useFormContext, useWatch } from 'react-hook-form'
import { useAddressResolver } from '@/hooks/useAddressResolver'
import { useCallback, useEffect } from 'react'
import { useMnemonicName } from '@/hooks/useMnemonicName'
import EthHashInfo from '@/components/common/EthHashInfo'
import { parsePrefixedAddress } from '@/utils/addresses'
import { NamedAddress, SafeFormData } from '@/components/create-safe/types'

export const OwnerRow = ({
  field,
  index,
  remove,
  readOnly = false,
}: {
  field: FieldArrayWithId<SafeFormData, 'owners', 'id'>
  index: number
  remove?: UseFieldArrayRemove
  readOnly?: boolean
}) => {
  const fallbackName = useMnemonicName()
  const { setValue, control, getValues } = useFormContext()
  const owner = useWatch({
    control,
    name: `owners.${index}`,
  })

  const validateSafeAddress = useCallback(
    async (address: string) => {
      const { address: safeAddress } = parsePrefixedAddress(address)
      const owners = getValues('owners')

      if (owners.filter((owner: NamedAddress) => owner.address === safeAddress).length > 1) {
        return 'Owner is already added'
      }
    },
    [getValues],
  )

  const { name, resolving } = useAddressResolver(owner.address)

  useEffect(() => {
    const ownerName = name ?? fallbackName
    setValue(`owners.${index}.name`, ownerName, { shouldValidate: true })
  }, [fallbackName, index, name, setValue])

  return (
    <Grid
      container
      key={field.id}
      spacing={3}
      alignItems="center"
      marginBottom={3}
      flexWrap={['wrap', undefined, 'nowrap']}
    >
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <NameInput
            name={`owners.${index}.name`}
            label="Owner name"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: resolving ? (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ) : null,
            }}
            required
          />
        </FormControl>
      </Grid>
      <Grid item xs={10} md={7}>
        {readOnly ? (
          <EthHashInfo address={owner.address} shortAddress={false} hasExplorer showCopyButton />
        ) : (
          <FormControl fullWidth>
            <AddressBookInput name={`owners.${index}.address`} label="Owner address" validate={validateSafeAddress} />
          </FormControl>
        )}
      </Grid>
      {!readOnly && (
        <Grid item xs={2} md={1} display="flex" alignItems="center" flexShrink={0}>
          {index > 0 && (
            <>
              <IconButton onClick={() => remove?.(index)}>
                <DeleteOutlineOutlinedIcon />
              </IconButton>
            </>
          )}
        </Grid>
      )}
    </Grid>
  )
}
