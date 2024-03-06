import { Box, Button, Divider } from '@mui/material'
import { getSafeInfo, type SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { useEffect } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'

import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import layoutCss from '@/components/new-safe/create/styles.module.css'
import type { NamedAddress } from '@/components/new-safe/create/types'
import type { LoadSafeFormData } from '@/components/new-safe/load'
import { OwnerRow } from '@/components/new-safe/OwnerRow'
import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

enum Field {
  owners = 'owners',
  threshold = 'threshold',
}

type FormData = {
  [Field.owners]: NamedAddress[]
  [Field.threshold]: number
}

const SafeOwnerStep = ({ data, onSubmit, onBack }: StepRenderProps<LoadSafeFormData>) => {
  const chainId = useChainId()
  const formMethods = useForm<FormData>({
    defaultValues: data,
    mode: 'onChange',
  })
  const {
    handleSubmit,
    setValue,
    control,
    formState: { isValid },
    getValues,
  } = formMethods

  const { fields } = useFieldArray({
    control,
    name: Field.owners,
  })

  const [safeInfo] = useAsync<SafeInfo>(() => {
    if (data.address) {
      return getSafeInfo(chainId, data.address)
    }
  }, [chainId, data.address])

  useEffect(() => {
    if (!safeInfo) return

    setValue(Field.threshold, safeInfo.threshold)

    const owners = safeInfo.owners.map((owner, i) => ({
      address: owner.value,
      name: getValues(`owners.${i}.name`) || '',
    }))

    setValue(Field.owners, owners)
  }, [getValues, safeInfo, setValue])

  const handleBack = () => {
    onBack(getValues())
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box data-sid="24945" className={layoutCss.row}>
          {fields.map((field, index) => (
            <OwnerRow key={field.id} index={index} groupName="owners" readOnly />
          ))}
        </Box>
        <Divider />
        <Box data-sid="16643" className={layoutCss.row}>
          <Box data-sid="10207" display="flex" flexDirection="row" justifyContent="space-between" gap={3}>
            <Button
              data-sid="18537"
              variant="outlined"
              size="small"
              onClick={handleBack}
              startIcon={<ArrowBackIcon fontSize="small" />}
            >
              Back
            </Button>
            <Button data-sid="60273" type="submit" variant="contained" size="stretched" disabled={!isValid}>
              Next
            </Button>
          </Box>
        </Box>
      </form>
    </FormProvider>
  )
}

export default SafeOwnerStep
