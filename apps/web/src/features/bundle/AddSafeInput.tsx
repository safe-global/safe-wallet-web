import useAllSafes from '@/features/myAccounts/hooks/useAllSafes'
import { shortenAddress } from '@/utils/formatters'
import { createFilterOptions } from '@mui/material/Autocomplete'
import uniqBy from 'lodash/uniqBy'
import { useMemo } from 'react'
import { Autocomplete, TextField, Typography } from '@mui/material'
import { Controller, useFormContext } from 'react-hook-form'
import css from './styles.module.css'
import EthHashInfo from '@/components/common/EthHashInfo'

const filter = createFilterOptions<{ address: string; chainId: string }>()

const AddSafeInput = ({ name }: { name: string }) => {
  const allSafes = useAllSafes()

  const { control } = useFormContext()

  const options = useMemo(() => {
    const safes = []
    const uniqueSafes = uniqBy(allSafes, 'address')
    const safeOptions = uniqueSafes.map((safe) => ({ address: safe.address, chainId: safe.chainId }))

    if (safeOptions) {
      safes.push(...safeOptions)
    }

    return safes
  }, [allSafes])

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { ref, ...field } }) => (
        <Autocomplete
          {...field}
          multiple
          disableCloseOnSelect
          className={css.autocomplete}
          options={options}
          onChange={(_e, newValue) => field.onChange(newValue)}
          getOptionLabel={(option) => shortenAddress(option.address)}
          isOptionEqualToValue={(option, value) => option.address === value.address}
          filterOptions={(options, params) => {
            const filtered = filter(options, params)

            const { inputValue } = params
            const isExisting = options.some((option) => inputValue === option.address)

            if (inputValue !== '' && !isExisting) {
              filtered.push({ address: inputValue, chainId: '1' })
            }

            return filtered
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              inputRef={ref}
              className={css.input}
              placeholder="Safe Accounts"
            />
          )}
          renderOption={(props, option) =>
            option ? (
              <Typography component="li" variant="body2" className={css.option} {...props}>
                <EthHashInfo
                  address={option.address || ''}
                  shortAddress={true}
                  avatarSize={24}
                  showPrefix={false}
                  copyAddress={false}
                />
              </Typography>
            ) : null
          }
        />
      )}
    />
  )
}

export default AddSafeInput
