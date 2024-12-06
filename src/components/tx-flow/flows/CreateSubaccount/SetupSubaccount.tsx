import {
  Box,
  Button,
  CardActions,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  SvgIcon,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import classNames from 'classnames'
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form'

import InfoIcon from '@/public/images/notifications/info.svg'
import AddIcon from '@/public/images/common/add.svg'
import DeleteIcon from '@/public/images/common/delete.svg'
import TxCard from '@/components/tx-flow/common/TxCard'
import useSafeAddress from '@/hooks/useSafeAddress'
import useAddressBook from '@/hooks/useAddressBook'
import NameInput from '@/components/common/NameInput'
import tokenInputCss from '@/components/common/TokenAmountInput/styles.module.css'
import NumberField from '@/components/common/NumberField'
import { useVisibleBalances } from '@/hooks/useVisibleBalances'
import { AutocompleteItem } from '@/components/tx-flow/flows/TokenTransfer/CreateTokenTransfer'
import { validateDecimalLength, validateLimitedAmount } from '@/utils/validation'
import { safeFormatUnits } from '@/utils/formatters'
import { useMnemonicSafeName } from '@/hooks/useMnemonicName'

import css from '@/components/tx-flow/flows/CreateSubaccount/styles.module.css'
import commonCss from '@/components/tx-flow/common/styles.module.css'

export type SetupSubaccountForm = {
  [SetupSubaccountFormFields.name]: string
  [SetupSubaccountFormFields.assets]: Array<Record<SetupSubaccountFormAssetFields, string>>
}

export enum SetupSubaccountFormFields {
  name = 'name',
  assets = 'assets',
}

export enum SetupSubaccountFormAssetFields {
  tokenAddress = 'tokenAddress',
  amount = 'amount',
}

export function SetUpSubaccount({
  params,
  onSubmit,
}: {
  params: SetupSubaccountForm
  onSubmit: (params: SetupSubaccountForm) => void
}) {
  const addressBook = useAddressBook()
  const safeAddress = useSafeAddress()
  const randomName = useMnemonicSafeName()
  const fallbackName = `${addressBook[safeAddress] ?? randomName} Subaccount`

  const formMethods = useForm<SetupSubaccountForm>({
    defaultValues: params,
    mode: 'onChange',
  })

  const onFormSubmit = (data: SetupSubaccountForm) => {
    onSubmit({
      ...data,
      [SetupSubaccountFormFields.name]: data[SetupSubaccountFormFields.name] || fallbackName,
    })
  }

  return (
    <TxCard>
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onFormSubmit)}>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Name your Subaccount and select which assets to fund it with. All selected assets will be transferred when
            deployed.
          </Typography>

          <FormControl fullWidth sx={{ mt: 3 }}>
            <NameInput
              name={SetupSubaccountFormFields.name}
              label="Name"
              placeholder={fallbackName}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                endAdornment: (
                  <Tooltip
                    title="This name is stored locally and will never be shared with us or any third parties."
                    arrow
                    placement="top"
                  >
                    <InputAdornment position="end">
                      <SvgIcon component={InfoIcon} inheritViewBox />
                    </InputAdornment>
                  </Tooltip>
                ),
              }}
            />
          </FormControl>

          <AssetInputs name={SetupSubaccountFormFields.assets} />

          <Divider className={commonCss.nestedDivider} />

          <CardActions>
            <Button variant="contained" type="submit">
              Next
            </Button>
          </CardActions>
        </form>
      </FormProvider>
    </TxCard>
  )
}

/**
 * Note: the following is very similar to TokenAmountInput but with key differences to support
 * a field array. Adjusting the former was initially attempted but proved to be too complex.
 * We should consider refactoring both to be more "pure" to share easier across components.
 */
function AssetInputs({ name }: { name: SetupSubaccountFormFields.assets }) {
  const { balances } = useVisibleBalances()

  const formMethods = useFormContext<SetupSubaccountForm>()
  const fieldArray = useFieldArray<SetupSubaccountForm>({ name })

  const selectedAssets = formMethods.watch(name)
  const nonSelectedAssets = balances.items.filter((item) => {
    return !selectedAssets.map((asset) => asset.tokenAddress).includes(item.tokenInfo.address)
  })
  const defaultAsset: SetupSubaccountForm[typeof name][number] = {
    tokenAddress: nonSelectedAssets[0]?.tokenInfo.address,
    amount: '',
  }

  return (
    <>
      {fieldArray.fields.map((field, index) => {
        const errors = formMethods.formState.errors?.[name]?.[index]
        const label =
          errors?.[SetupSubaccountFormAssetFields.tokenAddress]?.message ||
          errors?.[SetupSubaccountFormAssetFields.amount]?.message ||
          'Amount'
        const isError = !!errors && Object.keys(errors).length > 0

        const thisAsset = balances.items.find((item) => {
          return item.tokenInfo.address === selectedAssets[index][SetupSubaccountFormAssetFields.tokenAddress]
        })
        const thisAndNonSelectedAssets = balances.items.filter((item) => {
          return (
            item.tokenInfo.address === thisAsset?.tokenInfo.address ||
            nonSelectedAssets.some((nonSelected) => item.tokenInfo.address === nonSelected.tokenInfo.address)
          )
        })
        return (
          <Box className={css.assetInput} key={field.id}>
            <FormControl className={classNames(tokenInputCss.outline, { [tokenInputCss.error]: isError })} fullWidth>
              <InputLabel shrink required className={tokenInputCss.label}>
                {label}
              </InputLabel>

              <div className={tokenInputCss.inputs}>
                <Controller
                  name={`${name}.${index}.${SetupSubaccountFormAssetFields.amount}`}
                  rules={{
                    required: true,
                    validate: (value) => {
                      return (
                        validateLimitedAmount(value, thisAsset?.tokenInfo.decimals, thisAsset?.balance) ||
                        validateDecimalLength(value, thisAsset?.tokenInfo.decimals)
                      )
                    },
                  }}
                  render={({ field }) => {
                    const onClickMax = () => {
                      if (thisAsset) {
                        const maxAmount = safeFormatUnits(thisAsset.balance, thisAsset.tokenInfo.decimals)
                        field.onChange(maxAmount)
                      }
                    }
                    return (
                      <NumberField
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                          endAdornment: (
                            <Button className={tokenInputCss.max} onClick={onClickMax}>
                              Max
                            </Button>
                          ),
                        }}
                        className={tokenInputCss.amount}
                        required
                        placeholder="0"
                        {...field}
                      />
                    )
                  }}
                />

                <Divider orientation="vertical" flexItem />

                <Controller
                  name={`${name}.${index}.${SetupSubaccountFormAssetFields.tokenAddress}`}
                  rules={{ required: true }}
                  render={({ field }) => {
                    return (
                      <TextField
                        select
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                        }}
                        className={tokenInputCss.select}
                        required
                        sx={{ minWidth: '200px' }}
                        {...field}
                      >
                        {thisAndNonSelectedAssets.map((item) => {
                          return (
                            <MenuItem key={item.tokenInfo.address} value={item.tokenInfo.address}>
                              <AutocompleteItem {...item} />
                            </MenuItem>
                          )
                        })}
                      </TextField>
                    )
                  }}
                />
              </div>
            </FormControl>

            <IconButton onClick={() => fieldArray.remove(index)}>
              <SvgIcon component={DeleteIcon} inheritViewBox />
            </IconButton>
          </Box>
        )
      })}

      <Button
        variant="text"
        onClick={() => {
          fieldArray.append(defaultAsset, { shouldFocus: true })
        }}
        startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
        size="large"
        sx={{ my: 3 }}
        disabled={nonSelectedAssets.length === 0}
      >
        Fund new asset
      </Button>
    </>
  )
}
