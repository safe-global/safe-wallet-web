import { useRouter } from 'next/router'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import RadioGroup from '@mui/material/RadioGroup'
import FormLabel from '@mui/material/FormLabel'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { Controller, FormProvider, useForm, type DefaultValues } from 'react-hook-form'
import { type ReactElement } from 'react'
import type { ParsedUrlQuery } from 'querystring'

import AddressBookInput from '@/components/common/AddressBookInput'
import DatePickerInput from '@/components/common/DatePickerInput'
import { validateAmount } from '@/utils/validation'
import { getTxFilter } from '@/components/transactions/TxFilterForm/utils'
import { TxFilterType, type TxFilterFormState } from '@/components/transactions/TxFilterForm/types'

export const FILTER_TYPE_FIELD_NAME = 'type'
const DATE_FROM_FIELD_NAME = 'execution_date__gte'
const DATE_TO_FIELD_NAME = 'execution_date__lte'
const RECIPIENT_FIELD_NAME = 'to'
const AMOUNT_FIELD_NAME = 'value'
const TOKEN_ADDRESS_FIELD_NAME = 'token_address'
const MODULE_FIELD_NAME = 'module'
const NONCE_FIELD_NAME = 'nonce'

const defaultValues: DefaultValues<TxFilterFormState> = {
  [FILTER_TYPE_FIELD_NAME]: TxFilterType.INCOMING,
  //@ts-ignore - DatePicker requires a default of `null` to show an empty input/have no error
  [DATE_FROM_FIELD_NAME]: null,
  //@ts-ignore - DatePicker requires a default of `null` to show an empty input/have no error
  [DATE_TO_FIELD_NAME]: null,
  [RECIPIENT_FIELD_NAME]: '',
  [AMOUNT_FIELD_NAME]: '',
  [TOKEN_ADDRESS_FIELD_NAME]: '',
  [MODULE_FIELD_NAME]: '',
  [NONCE_FIELD_NAME]: '',
}

const filterKeys = Object.keys(defaultValues)

const hasTxFilterQuery = (query: ParsedUrlQuery): boolean => {
  return Object.keys(query).some((key) => filterKeys.includes(key))
}

const getFilterlessQuery = (query: ParsedUrlQuery): ParsedUrlQuery => {
  if (!hasTxFilterQuery(query)) {
    return query
  }

  return Object.entries(query).reduce<ParsedUrlQuery>((acc, [key, value]) => {
    if (!filterKeys.includes(key)) {
      acc[key] = value
    }
    return acc
  }, {})
}

const getDefaultValues = (query: ParsedUrlQuery): DefaultValues<TxFilterFormState> => {
  return {
    ...defaultValues,
    ...query,
  }
}

const TxFilterForm = (): ReactElement => {
  const router = useRouter()

  const formMethods = useForm<TxFilterFormState>({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: getDefaultValues(router.query),
  })

  const { register, control, watch, handleSubmit, reset, setError, formState, getValues } = formMethods

  const isFormDirty = formState.isDirty && !Object.keys(formState.dirtyFields).includes(FILTER_TYPE_FIELD_NAME)
  const canClear = hasTxFilterQuery(router.query) || isFormDirty

  const clearFilter = () => {
    if (!hasTxFilterQuery(router.query)) {
      reset({
        ...defaultValues,
        [FILTER_TYPE_FIELD_NAME]: getValues(FILTER_TYPE_FIELD_NAME),
      })
      return
    }

    router.replace({
      pathname: router.pathname,
      query: getFilterlessQuery(router.query),
    })
  }

  const filterType = watch(FILTER_TYPE_FIELD_NAME)

  const isIncomingFilter = filterType === TxFilterType.INCOMING
  const isMultisigFilter = filterType === TxFilterType.MULTISIG
  const isModuleFilter = filterType === TxFilterType.MODULE

  const onSubmit = (data: TxFilterFormState) => {
    const txFilter = getTxFilter(data)
    if (!txFilter) {
      return
    }

    console.log(data.type, txFilter)

    router.replace({
      pathname: router.pathname,
      query: {
        ...getFilterlessQuery(router.query),
        ...txFilter,
      },
    })
  }

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 4 }}>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <FormControl>
                <FormLabel>Transaction type</FormLabel>
                <Controller
                  name={FILTER_TYPE_FIELD_NAME}
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      {Object.values(TxFilterType).map((value) => (
                        <FormControlLabel value={value} control={<Radio />} label={value} key={value} />
                      ))}
                    </RadioGroup>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={9}>
              <FormControl sx={{ width: '100%' }}>
                <FormLabel sx={{ mb: 1 }}>Parameters</FormLabel>
                <Grid container spacing={2} xs={12}>
                  {!isModuleFilter && (
                    <>
                      <Grid item xs={12} md={6}>
                        <DatePickerInput name={DATE_FROM_FIELD_NAME} label="From" />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <DatePickerInput name={DATE_FROM_FIELD_NAME} label="To" />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name={AMOUNT_FIELD_NAME}
                          control={control}
                          rules={{ validate: validateAmount }}
                          render={({ field, fieldState }) => (
                            <TextField
                              label="Amount"
                              helperText={fieldState.error?.message}
                              error={!!fieldState.error}
                              {...field}
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                    </>
                  )}
                  {isIncomingFilter && (
                    <Grid item xs={12} md={6}>
                      <AddressBookInput label="Token address" {...register(TOKEN_ADDRESS_FIELD_NAME)} fullWidth />
                    </Grid>
                  )}
                  {isMultisigFilter && (
                    <>
                      <Grid item xs={12} md={6}>
                        <AddressBookInput label="Recipient" {...register(RECIPIENT_FIELD_NAME)} fullWidth />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name={NONCE_FIELD_NAME}
                          control={control}
                          rules={{ validate: validateAmount }}
                          render={({ field, fieldState }) => (
                            <TextField
                              label="Nonce"
                              helperText={fieldState.error?.message}
                              error={!!fieldState.error}
                              {...field}
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                    </>
                  )}
                  {isModuleFilter && (
                    <Grid item xs={12} md={6}>
                      <AddressBookInput label="Module" {...register(MODULE_FIELD_NAME)} fullWidth />
                    </Grid>
                  )}
                </Grid>
              </FormControl>
              <Grid item container md={6} sx={{ gap: 2, mt: 3 }}>
                <Button variant="contained" onClick={clearFilter} disabled={!canClear}>
                  Clear
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Apply
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </Paper>
  )
}

export default TxFilterForm
