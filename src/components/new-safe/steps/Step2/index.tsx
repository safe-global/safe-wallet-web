import { Button, SvgIcon, MenuItem, Select, Tooltip, Typography, Divider, Box } from '@mui/material'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import type { ReactElement } from 'react'

import AddIcon from '@/public/images/common/add.svg'
import InfoIcon from '@/public/images/notifications/info.svg'
import { OwnerRow } from './OwnerRow'
import type { NamedAddress } from '@/components/create-safe/types'
import type { StepRenderProps } from '../../CardStepper/useCardStepper'
import type { NewSafeFormData } from '../../CreateSafe'
import type { CreateSafeInfoItem } from '../../CreateSafeInfos'
import { useSafeSetupHints } from './useSafeSetupHints'
import useIsConnected from '@/hooks/useIsConnected'
import useSetCreationStep from '@/components/new-safe/CreateSafe/useSetCreationStep'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import css from './styles.module.css'
import layoutCss from '@/components/new-safe/CreateSafe/styles.module.css'

export type CreateSafeStep2Form = {
  owners: NamedAddress[]
  threshold: number
}

enum CreateSafeStep2Fields {
  owners = 'owners',
  threshold = 'threshold',
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
  const isConnected = useIsConnected()
  useSetCreationStep(setStep, isConnected)

  const formMethods = useForm<CreateSafeStep2Form>({
    mode: 'all',
    defaultValues: {
      [CreateSafeStep2Fields.owners]: data.owners,
      [CreateSafeStep2Fields.threshold]: data.threshold,
    },
  })

  const { register, handleSubmit, control, watch } = formMethods

  const allFormData = watch()

  const { fields: ownerFields, append: appendOwner, remove: removeOwner } = useFieldArray({ control, name: 'owners' })

  useSafeSetupHints(allFormData.threshold, ownerFields.length, setDynamicHint)

  const handleBack = () => {
    onBack(allFormData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} id={STEP_2_FORM_ID}>
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
              <Tooltip title="TODO: Add tooltip" arrow placement="top">
                <span style={{ display: 'flex' }}>
                  <SvgIcon component={InfoIcon} inheritViewBox color="border" fontSize="small" />
                </span>
              </Tooltip>
            </Typography>
            <Typography variant="body2">Use your mobile phone as your additional owner key</Typography>
          </Box>
        </Box>

        <Divider />
        <Box className={layoutCss.row}>
          <Typography variant="h4" fontWeight={700} display="inline-flex" alignItems="center" gap={1}>
            Threshold
            <Tooltip title="TODO: Add tooltip" arrow placement="top">
              <span style={{ display: 'flex' }}>
                <SvgIcon component={InfoIcon} inheritViewBox color="border" fontSize="small" />
              </span>
            </Tooltip>
          </Typography>
          <Typography variant="body2" mb={2}>
            Any transaction requires the confirmation of:
          </Typography>
          <Box display="flex" alignItems="center">
            <Select {...register(CreateSafeStep2Fields.threshold)} defaultValue={data.threshold} className={css.select}>
              {ownerFields.map((_, i) => (
                <MenuItem key={i} value={i + 1}>
                  {i + 1}
                </MenuItem>
              ))}
            </Select>{' '}
            out of {ownerFields.length} owner(s).
          </Box>
        </Box>
        <Divider />
        <Box className={layoutCss.row}>
          <Box display="flex" flexDirection="row" justifyContent="space-between" gap={3}>
            <Button variant="outlined" size="small" onClick={handleBack} startIcon={<ArrowBackIcon fontSize="small" />}>
              Back
            </Button>
            <Button type="submit" variant="contained" size="stretched" disabled={!isConnected}>
              Next
            </Button>
          </Box>
        </Box>
      </FormProvider>
    </form>
  )
}

export default CreateSafeStep2
