import { Button, SvgIcon, MenuItem, Select, Tooltip, Typography, Divider, Box } from '@mui/material'
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form'
import type { ReactElement } from 'react'

import AddIcon from '@/public/images/common/add.svg'
import InfoIcon from '@/public/images/notifications/info.svg'
import { OwnerRow } from './OwnerRow'
import type { NamedAddress } from '@/components/create-safe/types'
import type { StepRenderProps } from '../../CardStepper/useCardStepper'
import type { NewSafeFormData } from '../../CreateSafe'
import type { CreateSafeInfoItem } from '../../CreateSafeInfos'
import { useSafeSetupHints } from './useSafeSetupHints'
import useSyncSafeCreationStep from '@/components/new-safe/CreateSafe/useSyncSafeCreationStep'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import css from './styles.module.css'
import layoutCss from '@/components/new-safe/CreateSafe/styles.module.css'
import NetworkWarning from '@/components/new-safe/NetworkWarning'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import { CREATE_SAFE_EVENTS, trackEvent } from '@/services/analytics'

enum CreateSafeStep2Fields {
  owners = 'owners',
  threshold = 'threshold',
}

export type CreateSafeStep2Form = {
  [CreateSafeStep2Fields.owners]: NamedAddress[]
  [CreateSafeStep2Fields.threshold]: number
}

const STEP_2_FORM_ID = 'create-safe-step-2-form'

const CreateSafeStep2 = ({
  onSubmit,
  onBack,
  data,
  setStep,
  setDynamicHint,
}: StepRenderProps<NewSafeFormData> & {
  setDynamicHint: (hints: CreateSafeInfoItem | undefined) => void
}): ReactElement => {
  const isWrongChain = useIsWrongChain()
  useSyncSafeCreationStep(setStep)

  const formMethods = useForm<CreateSafeStep2Form>({
    mode: 'all',
    defaultValues: {
      [CreateSafeStep2Fields.owners]: data.owners,
      [CreateSafeStep2Fields.threshold]: data.threshold,
    },
  })

  const { handleSubmit, control, watch, formState, getValues, setValue } = formMethods

  const threshold = watch(CreateSafeStep2Fields.threshold)

  const {
    fields: ownerFields,
    append: appendOwner,
    remove,
  } = useFieldArray({ control, name: CreateSafeStep2Fields.owners })

  const removeOwner = (index: number): void => {
    // Set threshold if it's greater than the number of owners
    setValue(CreateSafeStep2Fields.threshold, Math.min(threshold, ownerFields.length - 1))
    remove(index)
  }

  const isDisabled = isWrongChain || !formState.isValid

  useSafeSetupHints(threshold, ownerFields.length, setDynamicHint)

  const handleBack = () => {
    const formData = getValues()
    onBack(formData)
  }

  const onFormSubmit = handleSubmit((data) => {
    onSubmit(data)

    trackEvent({
      ...CREATE_SAFE_EVENTS.OWNERS,
      label: data.owners.length,
    })

    trackEvent({
      ...CREATE_SAFE_EVENTS.THRESHOLD,
      label: data.threshold,
    })
  })

  return (
    <form onSubmit={onFormSubmit} id={STEP_2_FORM_ID}>
      <FormProvider {...formMethods}>
        <Box className={layoutCss.row}>
          {ownerFields.map((field, i) => (
            <OwnerRow
              key={field.id}
              index={i}
              removable={i > 0}
              groupName={CreateSafeStep2Fields.owners}
              remove={removeOwner}
            />
          ))}
          <Button
            variant="text"
            onClick={() => appendOwner({ name: '', address: '' }, { shouldFocus: true })}
            startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
            size="large"
          >
            Add new owner
          </Button>
          <Box p={2} mt={3} sx={{ backgroundColor: 'background.main', borderRadius: '8px' }}>
            <Typography variant="subtitle1" fontWeight={700} display="inline-flex" alignItems="center" gap={1}>
              Safe Mobile owner key (optional){' '}
              <Tooltip
                title="The Safe Mobile app allows for the generation of owner keys that you can add to this or an existing Safe."
                arrow
                placement="top"
              >
                <span style={{ display: 'flex' }}>
                  <SvgIcon component={InfoIcon} inheritViewBox color="border" fontSize="small" />
                </span>
              </Tooltip>
            </Typography>
            <Typography variant="body2">Use your mobile phone as an additional owner key</Typography>
          </Box>
        </Box>

        <Divider />
        <Box className={layoutCss.row}>
          <Typography variant="h4" fontWeight={700} display="inline-flex" alignItems="center" gap={1}>
            Threshold
            <Tooltip
              title="The threshold of a Safe specifies how many owners need to confirm a Safe transaction before it can be executed."
              arrow
              placement="top"
            >
              <span style={{ display: 'flex' }}>
                <SvgIcon component={InfoIcon} inheritViewBox color="border" fontSize="small" />
              </span>
            </Tooltip>
          </Typography>
          <Typography variant="body2" mb={2}>
            Any transaction requires the confirmation of:
          </Typography>
          <Box display="flex" alignItems="center">
            <Controller
              name={CreateSafeStep2Fields.threshold}
              control={control}
              render={({ field }) => (
                <Select {...field} className={css.select}>
                  {ownerFields.map(({ id }, i) => (
                    <MenuItem key={id} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />{' '}
            out of {ownerFields.length} owner(s).
          </Box>

          {isWrongChain && <NetworkWarning />}
        </Box>
        <Divider />
        <Box className={layoutCss.row}>
          <Box display="flex" flexDirection="row" justifyContent="space-between" gap={3}>
            <Button variant="outlined" size="small" onClick={handleBack} startIcon={<ArrowBackIcon fontSize="small" />}>
              Back
            </Button>
            <Button type="submit" variant="contained" size="stretched" disabled={isDisabled}>
              Next
            </Button>
          </Box>
        </Box>
      </FormProvider>
    </form>
  )
}

export default CreateSafeStep2
