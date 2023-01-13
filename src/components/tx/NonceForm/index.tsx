import { memo, useMemo } from 'react'
import type { ReactElement } from 'react'
import { useController, useFormContext, useWatch } from 'react-hook-form'
import { Autocomplete, IconButton, InputAdornment, MenuItem, Tooltip } from '@mui/material'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import useSafeInfo from '@/hooks/useSafeInfo'
import NumberField from '@/components/common/NumberField'
import useTxQueue, { useQueuedTxByNonce } from '@/hooks/useTxQueue'
import { isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'
import { uniqBy } from 'lodash'
import { getTransactionType } from '@/hooks/useTransactionType'
import useAddressBook from '@/hooks/useAddressBook'
import { getLatestTransactions } from '@/utils/tx-list'
import type { MenuItemProps } from '@mui/material'

type NonceFormProps = {
  name: string
  nonce: number
  recommendedNonce?: number
  readonly?: boolean
}

const NonceFormOption = memo(function NonceFormOption({
  nonce,
  menuItemProps,
}: {
  nonce: number
  menuItemProps: MenuItemProps
}): ReactElement {
  const addressBook = useAddressBook()
  const transactions = useQueuedTxByNonce(nonce)

  const label = useMemo(() => {
    const [{ transaction }] = getLatestTransactions(transactions)
    return getTransactionType(transaction, addressBook).text
  }, [addressBook, transactions])

  return (
    <MenuItem key={nonce} {...menuItemProps}>
      {nonce} ({label} transaction)
    </MenuItem>
  )
})

const NonceForm = ({ name, nonce, recommendedNonce, readonly }: NonceFormProps): ReactElement => {
  const { safe } = useSafeInfo()
  const safeNonce = safe.nonce || 0

  // Initialise form field
  const { setValue, control } = useFormContext() || {}
  const {
    field: { ref, onBlur, onChange, value },
    fieldState,
  } = useController({
    name,
    control,
    defaultValue: nonce,
    rules: {
      required: true,
      validate: (val: number) => {
        if (!Number.isInteger(val)) {
          return 'Nonce must be an integer'
        } else if (val < safeNonce) {
          return `Nonce can't be lower than ${safeNonce}`
        }
      },
    },
  })

  // Autocomplete options
  const { page } = useTxQueue()
  const queuedTxs = useMemo(() => {
    if (!page || page.results.length === 0) {
      return []
    }

    const txs = page.results.filter(isTransactionListItem).map((item) => item.transaction)

    return uniqBy(txs, (tx) => {
      return isMultisigExecutionInfo(tx.executionInfo) ? tx.executionInfo.nonce : ''
    })
  }, [page])

  const options = useMemo(() => {
    return queuedTxs
      .map((tx) => (isMultisigExecutionInfo(tx.executionInfo) ? tx.executionInfo.nonce : undefined))
      .filter((nonce) => nonce !== undefined)
  }, [queuedTxs])

  // Warn about a higher nonce
  const editableNonce = useWatch({ name, control, exact: true })
  const nonceWarning =
    recommendedNonce != null && editableNonce > recommendedNonce ? `Recommended nonce is ${recommendedNonce}` : ''
  const label = fieldState.error?.message || nonceWarning || 'Safe transaction nonce'

  const onResetNonce = () => {
    if (recommendedNonce != null) {
      setValue(name, recommendedNonce, { shouldValidate: true })
    }
  }

  return (
    <Autocomplete
      value={value}
      freeSolo
      // On option select or free text entry
      onInputChange={(_, value) => {
        onChange(value ? Number(value) : '')
      }}
      options={options}
      disabled={nonce == null || readonly}
      getOptionLabel={(option) => option.toString()}
      renderOption={(props, option: number) => <NonceFormOption menuItemProps={props} nonce={option} />}
      disableClearable
      componentsProps={{
        paper: {
          elevation: 2,
        },
      }}
      renderInput={(params) => (
        <NumberField
          {...params}
          name={name}
          onBlur={onBlur}
          inputRef={ref}
          error={!!fieldState.error}
          label={label}
          InputProps={{
            ...params.InputProps,
            endAdornment: !readonly &&
              recommendedNonce !== undefined &&
              recommendedNonce !== params.inputProps.value && (
                <InputAdornment position="end">
                  <Tooltip title="Reset to recommended nonce">
                    <IconButton onClick={onResetNonce} size="small" color="primary">
                      <RotateLeftIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            readOnly: readonly,
          }}
          InputLabelProps={{
            ...params.InputLabelProps,
            shrink: true,
          }}
        />
      )}
    />
  )
}

export default NonceForm
