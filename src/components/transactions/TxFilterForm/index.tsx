import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import RadioGroup from '@mui/material/RadioGroup'
import FormLabel from '@mui/material/FormLabel'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { Controller, FormProvider, useForm, useFormState, type DefaultValues } from 'react-hook-form'
import { useMemo, type ReactElement } from 'react'

import AddressBookInput from '@/components/common/AddressBookInput'
import DatePickerInput from '@/components/common/DatePickerInput'
import { validateAmount } from '@/utils/validation'
import { trackEvent } from '@/services/analytics'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'
import {
  type IncomingTxFilter,
  type ModuleTxFilter,
  type MultisigTxFilter,
  TxFilterType,
  txFilter,
  useTxFilter,
  TxFilter,
} from '@/utils/txHistoryFilter'

export enum TxFilterFormFieldNames {
  FILTER_TYPE = 'type',
  DATE_FROM = 'execution_date__gte',
  DATE_TO = 'execution_date__lte',
  RECIPIENT = 'to',
  AMOUNT = 'value',
  TOKEN_ADDRESS = 'token_address',
  MODULE = 'module',
  NONCE = 'nonce',
}

export type TxFilterFormState = {
  [TxFilterFormFieldNames.FILTER_TYPE]: TxFilterType
} & Omit<
  // The filter form uses a <DatePicker> whose value is of `Date` | `null`
  IncomingTxFilter & MultisigTxFilter & ModuleTxFilter,
  `${TxFilterFormFieldNames.DATE_FROM}` | `${TxFilterFormFieldNames.DATE_TO}`| `executed`
> & {
    [TxFilterFormFieldNames.DATE_FROM]: Date | null
    [TxFilterFormFieldNames.DATE_TO]: Date | null
  }

const defaultValues: DefaultValues<TxFilterFormState> = {
  [TxFilterFormFieldNames.FILTER_TYPE]: TxFilterType.INCOMING,
  [TxFilterFormFieldNames.DATE_FROM]: null,
  [TxFilterFormFieldNames.DATE_TO]: null,
  [TxFilterFormFieldNames.RECIPIENT]: '',
  [TxFilterFormFieldNames.AMOUNT]: '',
  [TxFilterFormFieldNames.TOKEN_ADDRESS]: '',
  [TxFilterFormFieldNames.MODULE]: '',
  [TxFilterFormFieldNames.NONCE]: '',
}

const getInitialFormValues = (filter: TxFilter): DefaultValues<TxFilterFormState> => {
  return {
    ...defaultValues,
    ...txFilter.formatFormData(filter),
  }
}

const TxFilterForm = ({ toggleFilter }: { toggleFilter: () => void }): ReactElement => {
  const [filter, setFilter] = useTxFilter()

  const formMethods = useForm<TxFilterFormState>({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: getInitialFormValues(filter),
  })

  const { register, control, watch, handleSubmit, reset, getValues } = formMethods

  const filterType = watch(TxFilterFormFieldNames.FILTER_TYPE)

  const isIncomingFilter = filterType === TxFilterType.INCOMING
  const isMultisigFilter = filterType === TxFilterType.MULTISIG
  const isModuleFilter = filterType === TxFilterType.MODULE

  // Only subscribe to relevant `formState`
  const { dirtyFields, isValid } = useFormState({ control })

  const dirtyFieldNames = Object.keys(dirtyFields)

  const canClear = useMemo(() => {
    const isFormDirty = dirtyFieldNames.some((name) => name !== TxFilterFormFieldNames.FILTER_TYPE)
    return !isValid || isFormDirty || getValues(TxFilterFormFieldNames.FILTER_TYPE) !== defaultValues[TxFilterFormFieldNames.FILTER_TYPE]
  }, [isValid, dirtyFieldNames])

  const clearFilter = () => {
    setFilter(null)

    reset({
      ...defaultValues,
      // Persist the current type
      [TxFilterFormFieldNames.FILTER_TYPE]: getValues(TxFilterFormFieldNames.FILTER_TYPE),
    })
  }

  const onSubmit = (data: TxFilterFormState) => {
    for (const name of dirtyFieldNames) {
      trackEvent({ ...TX_LIST_EVENTS.FILTER, label: name })
    }

    const filterData = txFilter.parseFormData(data)

    // Check if push will cause a full page reload
    setFilter(filterData)

    toggleFilter()
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
                  name={TxFilterFormFieldNames.FILTER_TYPE}
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
                <Grid container item spacing={2} xs={12}>
                  {!isModuleFilter && (
                    <>
                      <Grid item xs={12} md={6}>
                        <DatePickerInput name={TxFilterFormFieldNames.DATE_FROM} label="From" />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <DatePickerInput name={TxFilterFormFieldNames.DATE_TO} label="To" />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name={TxFilterFormFieldNames.AMOUNT}
                          control={control}
                          rules={{
                            validate: (val: string) => {
                              if (val.length > 0) {
                                return validateAmount(val)
                              }
                            },
                          }}
                          render={({ field, fieldState }) => (
                            <TextField
                              label={fieldState.error?.message || 'Amount'}
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
                      <AddressBookInput
                        label="Token address"
                        {...register(TxFilterFormFieldNames.TOKEN_ADDRESS)}
                        required={false}
                        fullWidth
                      />
                    </Grid>
                  )}
                  {isMultisigFilter && (
                    <>
                      <Grid item xs={12} md={6}>
                        <AddressBookInput
                          label="Recipient"
                          {...register(TxFilterFormFieldNames.RECIPIENT)}
                          required={false}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name={TxFilterFormFieldNames.NONCE}
                          control={control}
                          rules={{
                            validate: (val: string) => {
                              if (val.length > 0) {
                                return validateAmount(val)
                              }
                            },
                          }}
                          render={({ field, fieldState }) => (
                            <TextField
                              label={fieldState.error?.message || 'Nonce'}
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
                      <AddressBookInput
                        label="Module"
                        {...register(TxFilterFormFieldNames.MODULE)}
                        required={false}
                        fullWidth
                      />
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
