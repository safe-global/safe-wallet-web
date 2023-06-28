import { memo, type ReactElement, type SyntheticEvent, useCallback, useContext, useMemo, useRef, useState } from 'react'

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
import { isRejectionTx } from '@/utils/transactions'

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
  const [error, setError] = useState<string>()
  const { safe } = useSafeInfo()
  const previousNonces = usePreviousNonces()
  const { nonce, setNonce, safeTx, recommendedNonce } = useContext(SafeTxContext)
  const isEmpty = useRef<boolean>(false)
  const isEditable = !safeTx || safeTx?.signatures.size === 0
  const readonly = !isEditable || isRejectionTx(safeTx)

  const validateInput = useCallback(
    (value: string | AutocompleteValue<unknown, false, false, false>) => {
      const nonce = Number(value)

      if (isNaN(nonce)) {
        return 'Nonce must be a number'
      }

      if (nonce < safe.nonce) {
        return `Nonce can't be lower than ${safe.nonce}`
      }

      if (nonce >= Number.MAX_SAFE_INTEGER) {
        return 'Nonce is too big'
      }
    },
    [safe.nonce],
  )

  const handleChange = useCallback(
    (_e: SyntheticEvent, value: string | AutocompleteValue<unknown, false, false, false>) => {
      const error = validateInput(value)

      if (error) {
        setError(validateInput(value))
        isEmpty.current = false
        return
      }

      setError(undefined)
      isEmpty.current = value === ''
      setNonce(Number(value))
    },
    [validateInput, setNonce],
  )

  const handleBlur = useCallback(() => {
    setError(undefined)
  }, [])

  const resetNonce = useCallback(() => {
    setError(undefined)
    isEmpty.current = false
    setNonce(recommendedNonce)
  }, [recommendedNonce, setNonce])

  if (nonce === undefined) return <Skeleton variant="rounded" width={40} height={38} />

  return (
    <Box display="flex" alignItems="center" gap={1}>
      Nonce #
      <Autocomplete
        value={isEmpty.current ? '' : nonce}
        inputValue={isEmpty.current ? '' : nonce.toString()}
        freeSolo
        onChange={handleChange}
        onInputChange={handleChange}
        onBlur={handleBlur}
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
          <Tooltip title={error} open arrow placement="top">
            <NumberField
              {...params}
              error={!!error}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <InputAdornment position="end" className={css.adornment}>
                    <Tooltip title="Reset to recommended nonce">
                      <IconButton
                        onClick={resetNonce}
                        size="small"
                        color="primary"
                        disabled={readonly || recommendedNonce === undefined || recommendedNonce === nonce}
                      >
                        <RotateLeftIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
                readOnly: readonly,
              }}
              className={css.input}
              sx={{ minWidth: `${nonce.toString().length + 0.5}em` }}
            />
          </Tooltip>
        )}
        PopperComponent={CustomPopper}
      />
    </Box>
  )
}

export default TxNonce
