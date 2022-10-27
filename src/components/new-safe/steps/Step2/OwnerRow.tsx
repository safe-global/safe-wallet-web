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
import useWallet from '@/hooks/wallets/useWallet'
import { sameAddress } from '@/utils/addresses'

/**
 * TODO: this is a slightly modified copy of the old /create-safe/OwnerRow.tsx
 * Once we remove the old safe creation flow we should remove the old file.
 */
export const OwnerRow = ({
  index,
  groupName,
  removable = true,
  remove,
  readOnly = false,
}: {
  index: number
  removable?: boolean
  groupName: string
  remove?: (index: number) => void
  readOnly?: boolean
}) => {
  const wallet = useWallet()
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
      if (owners.filter((owner: NamedAddress) => sameAddress(owner.address, address)).length > 1) {
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
    <Grid container spacing={3} alignItems="flex-start" marginBottom={3} flexWrap={['wrap', undefined, 'nowrap']}>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth>
          <NameInput
            name={`${fieldName}.name`}
            label="Owner name"
            InputLabelProps={{ shrink: true }}
            placeholder={ens || `Owner ${index + 1}`}
            helperText={owner.address === wallet?.address && 'Your connected wallet'}
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
      <Grid item xs={11} md={7}>
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
        <Grid
          item
          ml={-3}
          xs={1}
          alignSelf="stretch"
          maxHeight="80px"
          md={1}
          display="flex"
          alignItems="center"
          flexShrink={0}
        >
          {removable && (
            <>
              <IconButton onClick={() => remove?.(index)}>
                <SvgIcon component={DeleteIcon} inheritViewBox />
              </IconButton>
            </>
          )}
        </Grid>
      )}
    </Grid>
  )
}
