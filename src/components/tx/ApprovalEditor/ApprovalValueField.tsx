import NumberField from '@/components/common/NumberField'
import TokenIcon from '@/components/common/TokenIcon'
import { shortenAddress } from '@/utils/formatters'
import { validateAmount, validateDecimalLength } from '@/utils/validation'
import { Autocomplete, Box, type MenuItemProps, Typography, MenuItem } from '@mui/material'
import { useController, useFormContext } from 'react-hook-form'
import css from './styles.module.css'
import { PSEUDO_APPROVAL_VALUES, type ApprovalInfo } from './utils/approvals'

const ApprovalOption = ({ menuItemProps, value }: { menuItemProps: MenuItemProps; value: string }) => {
  return (
    <MenuItem key={value} {...menuItemProps}>
      {value}
    </MenuItem>
  )
}

export const ApprovalValueField = ({
  name,
  readonly = false,
  tx,
}: {
  name: string
  readonly?: boolean
  tx: ApprovalInfo
}) => {
  const { control } = useFormContext()
  const selectValues = Object.values(PSEUDO_APPROVAL_VALUES)

  const {
    field: { ref, onBlur, onChange, value },
    fieldState,
  } = useController({
    name,
    control,
    rules: {
      required: true,
      validate: (val) => {
        if (selectValues.includes(val)) {
          return undefined
        }
        const decimals = tx.tokenInfo?.decimals
        return validateAmount(val, true) || validateDecimalLength(val, decimals)
      },
    },
  })

  const label = fieldState.error?.message || 'Token'
  const options = selectValues

  return (
    <Autocomplete
      freeSolo
      fullWidth
      options={options}
      renderOption={(props, value: string) => <ApprovalOption menuItemProps={props} value={value} />}
      value={value}
      // On option select or free text entry
      onInputChange={(_, value) => {
        onChange(value)
      }}
      readOnly={readonly}
      disabled={readonly}
      disableClearable
      selectOnFocus
      componentsProps={{
        paper: {
          elevation: 2,
        },
      }}
      renderInput={(params) => {
        return (
          <NumberField
            {...params}
            label={label}
            name={name}
            fullWidth
            error={!!fieldState.error}
            size="small"
            onBlur={onBlur}
            inputRef={ref}
            InputProps={{
              ...params.InputProps,
              sx: {
                paddingTop: '4px',
                paddingBottom: '4px',
                paddingLeft: 1,
                flexWrap: 'nowrap !important',
              },
              readOnly: readonly,
              startAdornment: (
                <Box display="flex" flexDirection="row" alignItems="center" gap="4px">
                  <TokenIcon size={32} logoUri={tx.tokenInfo?.logoUri} tokenSymbol={tx.tokenInfo?.symbol} />
                  <Typography>{tx.tokenInfo?.symbol || shortenAddress(tx.tokenAddress)}</Typography>
                </Box>
              ),
            }}
            inputProps={{
              ...params.inputProps,
              className: css.approvalAmount,
            }}
            InputLabelProps={{
              ...params.InputLabelProps,
              shrink: true,
            }}
          />
        )
      }}
    />
  )
}
