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
  Typography,
  ListSubheader,
  type ListSubheaderProps,
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

const CustomPopper = function ({
  // Don't set width of Popper to that of the field
  style: _,
  className,
  ...props
}: PopperProps) {
  return <Popper {...props} className={classNames(className, css.popper)} placement="bottom-start" />
}

const NonceFormHeader = memo(function NonceFormSubheader({ children, ...props }: ListSubheaderProps) {
  return (
    <ListSubheader {...props} disableSticky>
      <Typography variant="caption" fontWeight={700} color="text.secondary">
        {children}
      </Typography>
    </ListSubheader>
  )
})

const NonceFormOption = memo(function NonceFormOption({
  nonce,
  menuItemProps,
}: {
  nonce: string
  menuItemProps: MenuItemProps
}): ReactElement {
  const addressBook = useAddressBook()
  const transactions = useQueuedTxByNonce(Number(nonce))

  const label = useMemo(() => {
    const latestTransactions = getLatestTransactions(transactions)

    if (latestTransactions.length === 0) {
      return
    }

    const [{ transaction }] = latestTransactions
    return getTransactionType(transaction, addressBook).text
  }, [addressBook, transactions])

  return (
    <MenuItem {...menuItemProps}>
      <Typography variant="body2">
        <b>{nonce}</b>&nbsp;- {`${label || 'New'} transaction`}
      </Typography>
    </MenuItem>
  )
})

const getFieldMinWidth = (value: string): string => {
  const MIN_CHARS = 5
  const MAX_WIDTH = '200px'

  return `clamp(calc(${MIN_CHARS}ch + 6px), calc(${Math.max(MIN_CHARS, value.length)}ch + 6px), ${MAX_WIDTH})`
}

enum TxNonceFormFieldNames {
  NONCE = 'nonce',
}

const TxNonceForm = ({ nonce, recommendedNonce }: { nonce: string; recommendedNonce: string }) => {
  const { safeTx, setNonce } = useContext(SafeTxContext)
  const previousNonces = usePreviousNonces().map((nonce) => nonce.toString())
  const { safe } = useSafeInfo()

  const isEditable = !safeTx || safeTx?.signatures.size === 0
  const readOnly = !isEditable || isRejectionTx(safeTx)

  const formMethods = useForm({
    defaultValues: {
      [TxNonceFormFieldNames.NONCE]: nonce,
    },
    mode: 'all',
  })

  const resetNonce = () => {
    formMethods.setValue(TxNonceFormFieldNames.NONCE, recommendedNonce)
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

          // Update context with valid nonce
          setNonce(newNonce)
        },
      }}
      render={({ field, fieldState }) => {
        if (readOnly) {
          return (
            <Typography variant="body2" fontWeight={700} ml={-1}>
              {nonce}
            </Typography>
          )
        }

        const showRecommendedNonceButton = recommendedNonce !== field.value

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
            options={[recommendedNonce, ...previousNonces]}
            getOptionLabel={(option) => option.toString()}
            renderOption={(props, option) => {
              const isRecommendedNonce = option === recommendedNonce
              const isInitialPreviousNonce = option === previousNonces[0]

              return (
                <>
                  {isRecommendedNonce && <NonceFormHeader>Recommended nonce</NonceFormHeader>}
                  {isInitialPreviousNonce && <NonceFormHeader sx={{ pt: 3 }}>Already in queue</NonceFormHeader>}
                  <NonceFormOption key={option} menuItemProps={props} nonce={option} />
                </>
              )
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
                      minWidth: getFieldMinWidth(field.value),
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

const skeletonMinWidth = getFieldMinWidth('')

const TxNonce = () => {
  const { nonce, recommendedNonce } = useContext(SafeTxContext)

  return (
    <Box display="flex" alignItems="center" gap={1}>
      Nonce{' '}
      <Typography component="span" fontWeight={700}>
        #
      </Typography>
      {nonce === undefined || recommendedNonce === undefined ? (
        <Skeleton width={skeletonMinWidth} height="38px" />
      ) : (
        <TxNonceForm nonce={nonce.toString()} recommendedNonce={recommendedNonce.toString()} />
      )}
    </Box>
  )
}

export default TxNonce
