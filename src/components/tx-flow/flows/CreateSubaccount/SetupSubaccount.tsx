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
import { useMemo } from 'react'
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form'
import type { FieldArrayWithId, UseFormReturn } from 'react-hook-form'

import InfoIcon from '@/public/images/notifications/info.svg'
import AddIcon from '@/public/images/common/add.svg'
import DeleteIcon from '@/public/images/common/delete.svg'
import TxCard from '@/components/tx-flow/common/TxCard'
import { useMnemonicSafeName } from '@/hooks/useMnemonicName'
import NameInput from '@/components/common/NameInput'
import tokenInputCss from '@/components/common/TokenAmountInput/styles.module.css'
import NumberField from '@/components/common/NumberField'
import { useVisibleBalances } from '@/hooks/useVisibleBalances'
import { AutocompleteItem } from '@/components/tx-flow/flows/TokenTransfer/CreateTokenTransfer'
import { validateDecimalLength, validateLimitedAmount } from '@/utils/validation'
import { safeFormatUnits } from '@/utils/formatters'

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
  const { balances } = useVisibleBalances()
  const fallbackName = useMnemonicSafeName()
  const formMethods = useForm<SetupSubaccountForm>({
    defaultValues: params,
    mode: 'onChange',
  })
  const fieldArray = useFieldArray({
    control: formMethods.control,
    name: SetupSubaccountFormFields.assets,
  })

  const selectedAssets = formMethods.watch(SetupSubaccountFormFields.assets)
  const nonSelectedAssets = balances.items.filter((item) => {
    return !selectedAssets.map((asset) => asset.tokenAddress).includes(item.tokenInfo.address)
  })
  const defaultAsset: SetupSubaccountForm['assets'][number] = {
    // tokenAddress is "next" token that isn't selected to fund the subaccount
    tokenAddress: nonSelectedAssets[0]?.tokenInfo.address,
    amount: '',
  }
  const canFund = !!defaultAsset.tokenAddress

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
            It&apos;s possible to fund a Subaccount with multiple assets during deployment. You can select which assets
            you&apos;d like to fund the Subaccount with below, and they will be sent in the deployment transaction.
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

          {fieldArray.fields.map((field, index) => {
            return (
              <AssetInputRow
                key={field.id}
                field={field}
                index={index}
                balances={balances}
                selectedAssets={selectedAssets}
                formMethods={formMethods}
                remove={() => fieldArray.remove(index)}
              />
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
            disabled={!canFund}
          >
            Fund new asset
          </Button>

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
function AssetInputRow({
  field,
  index,
  balances,
  selectedAssets,
  formMethods,
  remove,
}: {
  field: FieldArrayWithId<SetupSubaccountForm, SetupSubaccountFormFields.assets, 'id'>
  index: number
  balances: ReturnType<typeof useVisibleBalances>['balances']
  selectedAssets: Record<SetupSubaccountFormAssetFields, string>[]
  formMethods: UseFormReturn<SetupSubaccountForm, any>
  remove: () => void
}) {
  const element = `${SetupSubaccountFormFields.assets}.${index}` as const

  const tokenAddress = selectedAssets[index][SetupSubaccountFormAssetFields.tokenAddress]
  const token = balances.items.find((item) => item.tokenInfo.address === tokenAddress)

  const errors = formMethods.formState.errors?.[SetupSubaccountFormFields.assets]?.[index]
  const isError = !!errors && Object.keys(errors).length > 0

  const label =
    errors?.[SetupSubaccountFormAssetFields.tokenAddress]?.message ||
    errors?.[SetupSubaccountFormAssetFields.amount]?.message ||
    'Amount'

  const otherAssets = useMemo(() => {
    return balances.items.filter((item) => {
      return !selectedAssets.some((asset) => {
        return asset.tokenAddress !== tokenAddress && asset.tokenAddress === item.tokenInfo.address
      })
    })
  }, [balances.items, selectedAssets, index])

  return (
    <Box className={css.assetInput} key={field.id}>
      <FormControl className={classNames(tokenInputCss.outline, { [tokenInputCss.error]: isError })} fullWidth>
        <InputLabel shrink required className={tokenInputCss.label}>
          {label}
        </InputLabel>

        <div className={tokenInputCss.inputs}>
          <Controller
            key={field.amount}
            name={`${element}.${SetupSubaccountFormAssetFields.amount}`}
            rules={{
              required: true,
              validate: (value) => {
                return (
                  validateLimitedAmount(value, token?.tokenInfo.decimals, token?.balance) ||
                  validateDecimalLength(value, token?.tokenInfo.decimals)
                )
              },
            }}
            render={({ field }) => {
              const onClickMax = () => {
                if (!token) {
                  return
                }
                const name =
                  `${SetupSubaccountFormFields.assets}.${index}.${SetupSubaccountFormAssetFields.amount}` as const
                const maxAmount = safeFormatUnits(token.balance, token.tokenInfo.decimals)
                formMethods.setValue(
                  name,
                  // @ts-expect-error - computed name does not return field typ
                  maxAmount,
                  {
                    shouldValidate: true,
                  },
                )
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
            key={field.tokenAddress}
            name={`${element}.${SetupSubaccountFormAssetFields.tokenAddress}`}
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
                  {...field}
                >
                  {otherAssets.map((item) => {
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

      <IconButton onClick={remove}>
        <SvgIcon component={DeleteIcon} inheritViewBox />
      </IconButton>
    </Box>
  )
}
