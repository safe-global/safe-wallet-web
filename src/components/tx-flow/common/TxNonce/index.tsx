import { memo, type ReactElement, type SyntheticEvent, useCallback, useContext, useMemo, useState } from 'react'

import {
  Autocomplete,
  Box,
  IconButton,
  InputAdornment,
  Skeleton,
  Tooltip,
  Popper,
  type PopperProps,
  type AutocompleteValue,
  type MenuItemProps,
  MenuItem,
} from '@mui/material'
import { SafeTxContext } from '../../SafeTxProvider'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import NumberField from '@/components/common/NumberField'
import { useQueuedTxByNonce } from '@/hooks/useTxQueue'
import useSafeInfo from '@/hooks/useSafeInfo'
import css from './styles.module.css'
import useAddressBook from '@/hooks/useAddressBook'
import { getLatestTransactions } from '@/utils/tx-list'
import { getTransactionType } from '@/hooks/useTransactionType'
import usePreviousNonces from '@/hooks/usePreviousNonces'

const CustomPopper = function (props: PopperProps) {
  return <Popper {...props} sx={{ width: '300px !important' }} placement="bottom-start" />
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

const TxNonce = () => {
  const [error, setError] = useState<boolean>(false)
  const { safe } = useSafeInfo()
  const previousNonces = usePreviousNonces()
  const { nonce, setNonce, safeTx, recommendedNonce } = useContext(SafeTxContext)
  const isEditable = !safeTx || safeTx?.signatures.size === 0
  const readonly = !isEditable

  const isValidInput = useCallback(
    (value: string | AutocompleteValue<unknown, false, false, false>) => {
      return Number(value) >= safe.nonce
    },
    [safe.nonce],
  )

  const handleChange = useCallback(
    (e: SyntheticEvent, value: string | AutocompleteValue<unknown, false, false, false>) => {
      const nonce = Number(value)
      if (isNaN(nonce)) return
      setError(!isValidInput(value))
      setNonce(nonce)
    },
    [isValidInput, setNonce],
  )

  const resetNonce = useCallback(() => {
    setError(false)
    setNonce(recommendedNonce)
  }, [recommendedNonce, setNonce])

  if (nonce === undefined) return <Skeleton variant="rounded" width={40} height={26} />

  return (
    <Box display="flex" alignItems="center" gap={1}>
      Nonce
      <Autocomplete
        value={nonce}
        inputValue={nonce.toString()}
        freeSolo
        onChange={handleChange}
        onInputChange={handleChange}
        options={previousNonces}
        disabled={readonly}
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
            error={error}
            InputProps={{
              ...params.InputProps,
              endAdornment: !readonly && recommendedNonce !== undefined && recommendedNonce !== nonce && (
                <InputAdornment position="end" className={css.adornment}>
                  <Tooltip title="Reset to recommended nonce">
                    <IconButton onClick={resetNonce} size="small" color="primary">
                      <RotateLeftIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
              readOnly: readonly,
            }}
            className={css.input}
          />
        )}
        PopperComponent={CustomPopper}
      />
    </Box>
  )
}

export default TxNonce
