import { useCallback, useEffect, useMemo } from 'react'
import { CircularProgress, FormControl, Grid, IconButton, SvgIcon } from '@mui/material'
import NameInput from '@/components/common/NameInput'
import InputAdornment from '@mui/material/InputAdornment'
import AddressBookInput from '@/components/common/AddressBookInput'
import DeleteIcon from '@/public/images/common/delete.svg'
import { useFormContext, useWatch } from 'react-hook-form'
import { useAddressResolver } from '@/hooks/useAddressResolver'
import EthHashInfo from '@/components/common/EthHashInfo'
import type { NamedAddress } from '@/components/create-safe/types'

export const OwnerRow = ({
  index,
  groupName,
  remove,
  readOnly = false,
}: {
  index: number
  groupName: string
  remove?: (index: number) => void
  readOnly?: boolean
}) => {
  const fieldName = `${groupName}.${index}`
  const { control, getValues, setValue } = useFormContext()
  const owners = useWatch({
    control,
    name: groupName,
  })
  const owner = useWatch({
    control,
    name: fieldName,
  })

  const deps = useMemo(() => {
    return Array.from({ length: owners.length }, (_, i) => `${groupName}.${i}`)
  }, [owners, groupName])

  const validateSafeAddress = useCallback(
    async (address: string) => {
      if (owners.filter((owner: NamedAddress) => owner.address === address).length > 1) {
        return 'Owner is already added'
      }
    },
    [owners],
  )

  const { ens, name, resolving } = useAddressResolver(owner.address)

  useEffect(() => {
    if (ens) {
      setValue(`${fieldName}.ens`, ens)
    }

    if (name && !getValues(`${fieldName}.name`)) {
      setValue(`${fieldName}.name`, name)
    }
  }, [ens, setValue, getValues, name, fieldName])

  return (
    <Grid container spacing={3} alignItems="center" marginBottom={3} flexWrap={['wrap', undefined, 'nowrap']}>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <NameInput
            name={`${fieldName}.name`}
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
            <AddressBookInput
              name={`${fieldName}.address`}
              label="Owner address"
              validate={validateSafeAddress}
              deps={deps}
            />
          </FormControl>
        )}
      </Grid>
      {!readOnly && (
        <Grid item xs={2} md={1} display="flex" alignItems="center" flexShrink={0}>
          {index > 0 && (
            <>
              <IconButton onClick={() => remove?.(index)} size="small">
                <SvgIcon component={DeleteIcon} inheritViewBox />
              </IconButton>
            </>
          )}
        </Grid>
      )}
    </Grid>
  )
}
