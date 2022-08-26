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
import { Controller, FormProvider, useForm, useFormState, type DefaultValues } from 'react-hook-form'
import { useMemo, type ReactElement } from 'react'
import type { ParsedUrlQuery } from 'querystring'

import AddressBookInput from '@/components/common/AddressBookInput'
import DatePickerInput from '@/components/common/DatePickerInput'
import { validateAmount } from '@/utils/validation'
import { trackEvent } from '@/services/analytics'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'
import {
  omitFilterQuery,
  getTxFilterQuery,
  hasTxFilterQuery,
  DEFAULT_MULTISIG_EXECUTED,
  type IncomingTxFilter,
  type ModuleTxFilter,
  type MultisigTxFilter,
} from '@/utils/txHistoryFilter'

export enum TxFilterFormFieldNames {
  FILTER_TYPE_FIELD_NAME = 'type',
  DATE_FROM_FIELD_NAME = 'execution_date__gte',
  DATE_TO_FIELD_NAME = 'execution_date__lte',
  RECIPIENT_FIELD_NAME = 'to',
  AMOUNT_FIELD_NAME = 'value',
  TOKEN_ADDRESS_FIELD_NAME = 'token_address',
  MODULE_FIELD_NAME = 'module',
  NONCE_FIELD_NAME = 'nonce',
  MULTISIG_EXECUTED = 'executed',
}

export enum TxFilterFormType {
  INCOMING = 'Incoming',
  MULTISIG = 'Outgoing',
  MODULE = 'Module-based',
}

export type TxFilterFormState = {
  [TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME]: TxFilterFormType
} & Omit<
  // The filter form uses a <DatePicker> whose value is of `Date` | `null`
  IncomingTxFilter & MultisigTxFilter & ModuleTxFilter,
  `${TxFilterFormFieldNames.DATE_FROM_FIELD_NAME}` | `${TxFilterFormFieldNames.DATE_TO_FIELD_NAME}`
> & {
    [TxFilterFormFieldNames.DATE_FROM_FIELD_NAME]: Date | null
    [TxFilterFormFieldNames.DATE_TO_FIELD_NAME]: Date | null
  }

const defaultValues: DefaultValues<TxFilterFormState> = {
  [TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME]: TxFilterFormType.INCOMING,
  [TxFilterFormFieldNames.DATE_FROM_FIELD_NAME]: null,
  [TxFilterFormFieldNames.DATE_TO_FIELD_NAME]: null,
  [TxFilterFormFieldNames.RECIPIENT_FIELD_NAME]: '',
  [TxFilterFormFieldNames.AMOUNT_FIELD_NAME]: '',
  [TxFilterFormFieldNames.TOKEN_ADDRESS_FIELD_NAME]: '',
  [TxFilterFormFieldNames.MODULE_FIELD_NAME]: '',
  [TxFilterFormFieldNames.NONCE_FIELD_NAME]: '',
  [TxFilterFormFieldNames.MULTISIG_EXECUTED]: DEFAULT_MULTISIG_EXECUTED,
}

const getDefaultValues = (query: ParsedUrlQuery): DefaultValues<TxFilterFormState> => {
  return {
    ...defaultValues,
    ...query,
  }
}

const TxFilterForm = ({ toggleFilter }: { toggleFilter: () => void }): ReactElement => {
  const router = useRouter()

  const formMethods = useForm<TxFilterFormState>({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: getDefaultValues(router.query),
  })

  const { register, control, watch, handleSubmit, reset, getValues } = formMethods

  const filterType = watch(TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME)

  const isIncomingFilter = filterType === TxFilterFormType.INCOMING
  const isMultisigFilter = filterType === TxFilterFormType.MULTISIG
  const isModuleFilter = filterType === TxFilterFormType.MODULE

  // Only subscribe to relevant `formState`
  const { dirtyFields, isValid } = useFormState({ control })

  const dirtyFieldNames = Object.keys(dirtyFields)

  const canClear = useMemo(() => {
    const isFormDirty = dirtyFieldNames.some((name) => name !== TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME)
    return !isValid || isFormDirty || hasTxFilterQuery(router.query)
  }, [isValid, dirtyFieldNames, router.query])

  const clearFilter = () => {
    if (hasTxFilterQuery(router.query)) {
      router.replace({
        pathname: router.pathname,
        query: omitFilterQuery(router.query),
      })
    }

    reset({
      ...defaultValues,
      [TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME]: getValues(TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME),
    })
  }

  const onSubmit = (data: TxFilterFormState) => {
    for (const name of dirtyFieldNames) {
      trackEvent({ ...TX_LIST_EVENTS.FILTER, label: name })
    }

    router.replace({
      pathname: router.pathname,
      query: {
        ...omitFilterQuery(router.query),
        ...getTxFilterQuery(data),
        // We only filter historical multisig transactions
        ...(isMultisigFilter && { executed: DEFAULT_MULTISIG_EXECUTED }),
      },
    })

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
                  name={TxFilterFormFieldNames.FILTER_TYPE_FIELD_NAME}
                  control={control}
                  render={({ field }) => (
                    <RadioGroup {...field}>
                      {Object.values(TxFilterFormType).map((value) => (
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
                        <DatePickerInput name={TxFilterFormFieldNames.DATE_FROM_FIELD_NAME} label="From" />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <DatePickerInput name={TxFilterFormFieldNames.DATE_TO_FIELD_NAME} label="To" />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name={TxFilterFormFieldNames.AMOUNT_FIELD_NAME}
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
                        {...register(TxFilterFormFieldNames.TOKEN_ADDRESS_FIELD_NAME)}
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
                          {...register(TxFilterFormFieldNames.RECIPIENT_FIELD_NAME)}
                          required={false}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name={TxFilterFormFieldNames.NONCE_FIELD_NAME}
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
                        {...register(TxFilterFormFieldNames.MODULE_FIELD_NAME)}
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
