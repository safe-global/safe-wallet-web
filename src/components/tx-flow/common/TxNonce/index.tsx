import { memo, type ReactElement, type SyntheticEvent, useCallback, useContext, useMemo } from 'react'

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
import { isMultisigExecutionInfo, isTransactionListItem } from '@/utils/transaction-guards'
import { uniqBy } from 'lodash'
import useTxQueue, { useQueuedTxByNonce } from '@/hooks/useTxQueue'
import useSafeInfo from '@/hooks/useSafeInfo'
import css from './styles.module.css'
import useAddressBook from '@/hooks/useAddressBook'
import { getLatestTransactions } from '@/utils/tx-list'
import { getTransactionType } from '@/hooks/useTransactionType'

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
  const { page } = useTxQueue()
  const { safe } = useSafeInfo()
  const safeNonce = safe.nonce || 0
  const { nonce, setNonce, safeTx, recommendedNonce } = useContext(SafeTxContext)
  const isEditable = !safeTx || safeTx?.signatures.size === 0
  const readonly = !isEditable

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
      .filter((nonce) => nonce !== undefined) as number[]
  }, [queuedTxs])

  // TODO: Add error/warning somewhere
  const validateInput = (value: string) => {
    if (!Number.isInteger(value)) {
      return false
    } else if (Number(value) < safeNonce) {
      return false
    }
  }

  const handleChange = useCallback(
    (e: SyntheticEvent, value: string | AutocompleteValue<unknown, false, false, false>) => {
      const nonce = Number(value)
      if (isNaN(nonce)) return
      setNonce(nonce)
    },
    [setNonce],
  )

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
        options={options}
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
            InputProps={{
              ...params.InputProps,
              endAdornment: recommendedNonce !== undefined && recommendedNonce !== nonce && (
                <InputAdornment position="end" className={css.adornment}>
                  <Tooltip title="Reset to recommended nonce">
                    <IconButton onClick={() => setNonce(recommendedNonce)} size="small" color="primary">
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
