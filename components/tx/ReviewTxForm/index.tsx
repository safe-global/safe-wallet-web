import ErrorToast from '@/components/common/ErrorToast'
import useSafeTxGas from '@/services/useSafeTxGas'
import { MetaTransactionData } from '@gnosis.pm/safe-core-sdk-types'
import { FormControl, TextField, Button } from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import css from './styles.module.css'

export type ReviewTxFormData = {
  nonce: number
  safeTxGas: number
}

type ReviewTxFormProps = {
  txParams?: MetaTransactionData
  onFormSubmit: (data: ReviewTxFormData) => void
}

export const ReviewTxForm = ({ txParams, onFormSubmit }: ReviewTxFormProps) => {
  const { safeGas, safeGasError, safeGasLoading } = useSafeTxGas(txParams)
  const [isSubmittable, setIsSubmittable] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewTxFormData>()

  // Always include safeTxGas although not editable
  register('safeTxGas', { value: Number(safeGas?.safeTxGas || 0) })

  return (
    <form
      onSubmit={() => {
        setIsSubmittable(false)
        handleSubmit(onFormSubmit)
        setIsSubmittable(true)
      }}
    >
      <FormControl fullWidth>
        <TextField
          disabled={safeGasLoading}
          label="Nonce"
          error={!!errors.nonce}
          helperText={errors.nonce?.message}
          type="number"
          key={safeGas?.recommendedNonce}
          defaultValue={safeGas?.recommendedNonce}
          {...register('nonce', {
            valueAsNumber: true, // Set field to number type to auto parseInt
            required: true,
          })}
        />
      </FormControl>

      <div className={css.submit}>
        <Button variant="contained" type="submit" disabled={!isSubmittable}>
          Submit
        </Button>
      </div>

      {safeGasError && <ErrorToast message={safeGasError.message} />}
    </form>
  )
}
