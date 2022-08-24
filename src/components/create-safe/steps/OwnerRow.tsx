import { useCallback, useEffect } from 'react'
import { CircularProgress, FormControl, Grid, IconButton } from '@mui/material'
import NameInput from '@/components/common/NameInput'
import InputAdornment from '@mui/material/InputAdornment'
import AddressBookInput from '@/components/common/AddressBookInput'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import { UseFieldArrayRemove, useFormContext, useWatch } from 'react-hook-form'
import { useAddressResolver } from '@/hooks/useAddressResolver'
import EthHashInfo from '@/components/common/EthHashInfo'
import { NamedAddress } from '@/components/create-safe/types'

export const OwnerRow = ({
  index,
  remove,
  readOnly = false,
}: {
  index: number
  remove?: UseFieldArrayRemove
  readOnly?: boolean
}) => {
  const { control, getValues, setValue } = useFormContext()
  const owner = useWatch({
    control,
    name: `owners.${index}`,
  })

  const validateSafeAddress = useCallback(
    async (address: string) => {
      const owners = getValues('owners')
      if (owners.filter((owner: NamedAddress) => owner.address === address).length > 1) {
        return 'Owner is already added'
      }
    },
    [getValues],
  )

  const { ens, resolving } = useAddressResolver(owner.address)

  useEffect(() => {
    if (ens) {
      setValue(`owners.${index}.ens`, ens)
    }
  }, [ens, setValue, index])

  return (
    <Grid container spacing={3} alignItems="center" marginBottom={3} flexWrap={['wrap', undefined, 'nowrap']}>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <NameInput
            name={`owners.${index}.name`}
            label="Owner name"
            InputLabelProps={{ shrink: true }}
            placeholder={ens || `Owner ${index + 1}`}
            InputProps={{
              endAdornment: resolving ? (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ) : null,
            }}
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
