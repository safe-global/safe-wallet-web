import { CircularProgress, FormControl, Grid, IconButton } from '@mui/material'
import NameInput from '@/components/common/NameInput'
import InputAdornment from '@mui/material/InputAdornment'
import AddressBookInput from '@/components/common/AddressBookInput'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { FieldArrayWithId, UseFieldArrayRemove, useFormContext, useWatch } from 'react-hook-form'
import { CreateSafeFormData } from '@/components/create-safe'
import { useAddressResolver } from '@/hooks/useAddressResolver'
import { useEffect } from 'react'
import { LoadSafeFormData } from '@/components/load-safe'
import { useMnemonicName } from '@/hooks/useMnemonicName'

export const OwnerRow = ({
  field,
  index,
  remove,
  disabled = false,
}: {
  field: FieldArrayWithId<CreateSafeFormData | LoadSafeFormData, 'owners', 'id'>
  index: number
  remove?: UseFieldArrayRemove
  disabled?: boolean
}) => {
  const fallbackName = useMnemonicName()
  const { setValue, control } = useFormContext()
  const owner = useWatch({
    control,
    name: `owners.${index}`,
  })

  const { name, resolving } = useAddressResolver(owner.address)

  useEffect(() => {
    const ownerName = name ?? fallbackName
    setValue(`owners.${index}.name`, ownerName, { shouldValidate: true })
    setValue(`owners.${index}.resolving`, resolving)
  }, [fallbackName, index, name, resolving, setValue])

  return (
    <Grid container key={field.id} spacing={3} marginBottom={3} flexWrap={['wrap', undefined, 'nowrap']}>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <NameInput
            name={`owners.${index}.name`}
            label="Owner name"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: owner.resolving ? (
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
        <FormControl fullWidth>
          <AddressBookInput
            name={`owners.${index}.address`}
            label="Owner address"
            InputProps={{ readOnly: disabled }}
          />
        </FormControl>
      </Grid>
      {!disabled && (
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
