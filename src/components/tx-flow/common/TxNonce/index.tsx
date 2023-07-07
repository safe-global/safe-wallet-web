import { memo, type ReactElement, useContext, useMemo } from 'react'
import {
  Autocomplete,
  Box,
  IconButton,
  InputAdornment,
  Skeleton,
  Tooltip,
  Popper,
  type PopperProps,
  type MenuItemProps,
  MenuItem,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'

import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import NumberField from '@/components/common/NumberField'
import { useQueuedTxByNonce } from '@/hooks/useTxQueue'
import useSafeInfo from '@/hooks/useSafeInfo'
import useAddressBook from '@/hooks/useAddressBook'
import { getLatestTransactions } from '@/utils/tx-list'
import { getTransactionType } from '@/hooks/useTransactionType'
import usePreviousNonces from '@/hooks/usePreviousNonces'
import { isRejectionTx } from '@/utils/transactions'

import css from './styles.module.css'
import classNames from 'classnames'

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

enum TxNonceFormFieldNames {
  NONCE = 'nonce',
}

const TxNonceForm = ({ nonce, recommendedNonce }: { nonce: number; recommendedNonce: number }) => {
  const { safeTx, setNonce } = useContext(SafeTxContext)
  const previousNonces = usePreviousNonces()
  const { safe } = useSafeInfo()

  const isEditable = !safeTx || safeTx?.signatures.size === 0
  const readOnly = !isEditable || isRejectionTx(safeTx)

  const formMethods = useForm({
    defaultValues: {
      [TxNonceFormFieldNames.NONCE]: nonce.toString(),
    },
    mode: 'all',
  })

  const resetNonce = () => {
    formMethods.setValue(TxNonceFormFieldNames.NONCE, recommendedNonce.toString())
  }

  return (
    <Controller
      name={TxNonceFormFieldNames.NONCE}
      control={formMethods.control}
      rules={{
        required: 'Nonce is required',
        // Validation must be async to allow resetting invalid values onBlur
        validate: async (value) => {
          const newNonce = Number(value)

          if (isNaN(newNonce)) {
            return 'Nonce must be a number'
          }

          if (newNonce < safe.nonce) {
            return `Nonce can't be lower than ${safe.nonce}`
          }

          if (newNonce >= Number.MAX_SAFE_INTEGER) {
            return 'Nonce is too high'
          }

          // Update contect with valid nonce
          setNonce(newNonce)
        },
      }}
      render={({ field, fieldState }) => {
        if (readOnly) {
          return <>{nonce}</>
        }

        console.log(field, field.value)

        const showRecommendedNonceButton = recommendedNonce.toString() !== field.value

        return (
          <Autocomplete
            value={field.value}
            freeSolo
            onChange={(_, value) => field.onChange(value)}
            onInputChange={(_, value) => field.onChange(value)}
            onBlur={() => {
              field.onBlur()

              if (fieldState.error) {
                formMethods.setValue(field.name, recommendedNonce.toString())
              }
            }}
            options={previousNonces}
            getOptionLabel={(option) => option.toString()}
            renderOption={(props, option) => {
              return <NonceFormOption menuItemProps={props} nonce={option} />
            }}
            disableClearable
            componentsProps={{
              paper: {
                elevation: 2,
              },
            }}
            renderInput={(params) => {
              return (
                <Tooltip title={fieldState.error?.message} open arrow placement="top">
                  <NumberField
                    {...params}
                    error={!!fieldState.error}
                    InputProps={{
                      ...params.InputProps,
                      name: field.name,
                      endAdornment: showRecommendedNonceButton ? (
                        <InputAdornment position="end" className={css.adornment}>
                          <Tooltip title="Reset to recommended nonce">
                            <IconButton onClick={resetNonce} size="small" color="primary">
                              <RotateLeftIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ) : null,
                    }}
                    className={classNames([
                      css.input,
                      {
                        [css.withAdornment]: showRecommendedNonceButton,
                      },
                    ])}
                    sx={{
                      minWidth: `clamp(1ch, calc(${field.value.toString().length}ch${
                        showRecommendedNonceButton ? ' + 28px' : ' + 4px'
                      }), 200px)`,
                    }}
                  />
                </Tooltip>
              )
            }}
            PopperComponent={CustomPopper}
          />
        )
      }}
    />
  )
}

const TxNonce = () => {
  const { nonce, recommendedNonce } = useContext(SafeTxContext)

  return (
    <Box display="flex" alignItems="center" gap={1}>
      Nonce #
      {nonce === undefined || recommendedNonce === undefined ? (
        <Skeleton width="70px" height="38px" />
      ) : (
        <TxNonceForm nonce={nonce} recommendedNonce={recommendedNonce} />
      )}
    </Box>
  )
}

export default TxNonce
