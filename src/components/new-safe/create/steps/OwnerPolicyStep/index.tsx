import CounterfactualHint from '@/features/counterfactual/CounterfactualHint'
import { Box, Button, Divider, Grid, MenuItem, SvgIcon, TextField, Tooltip, Typography } from '@mui/material'
import type { ReactElement } from 'react'
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form'

import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import OwnerRow from '@/components/new-safe/OwnerRow'
import type { NewSafeFormData } from '@/components/new-safe/create'
import type { CreateSafeInfoItem } from '@/components/new-safe/create/CreateSafeInfos'
import { useSafeSetupHints } from '@/components/new-safe/create/steps/OwnerPolicyStep/useSafeSetupHints'
import layoutCss from '@/components/new-safe/create/styles.module.css'
import type { NamedAddress } from '@/components/new-safe/create/types'
import useSyncSafeCreationStep from '@/components/new-safe/create/useSyncSafeCreationStep'
import AddIcon from '@/public/images/common/add.svg'
import InfoIcon from '@/public/images/notifications/info.svg'
import { CREATE_SAFE_EVENTS, trackEvent } from '@/services/analytics'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

enum OwnerPolicyStepFields {
  owners = 'owners',
  threshold = 'threshold',
}

export type OwnerPolicyStepForm = {
  [OwnerPolicyStepFields.owners]: NamedAddress[]
  [OwnerPolicyStepFields.threshold]: number
}

const OWNER_POLICY_STEP_FORM_ID = 'create-safe-owner-policy-step-form'

const OwnerPolicyStep = ({
  onSubmit,
  onBack,
  data,
  setStep,
  setDynamicHint,
}: StepRenderProps<NewSafeFormData> & {
  setDynamicHint: (hints: CreateSafeInfoItem | undefined) => void
}): ReactElement => {
  useSyncSafeCreationStep(setStep)

  const formMethods = useForm<OwnerPolicyStepForm>({
    mode: 'onChange',
    defaultValues: {
      [OwnerPolicyStepFields.owners]: data.owners,
      [OwnerPolicyStepFields.threshold]: data.threshold,
    },
  })

  const { handleSubmit, control, watch, formState, getValues, setValue, trigger } = formMethods

  const threshold = watch(OwnerPolicyStepFields.threshold)

  const {
    fields: ownerFields,
    append: appendOwner,
    remove,
  } = useFieldArray({ control, name: OwnerPolicyStepFields.owners })

  const removeOwner = (index: number): void => {
    // Set threshold if it's greater than the number of owners
    setValue(OwnerPolicyStepFields.threshold, Math.min(threshold, ownerFields.length - 1))
    remove(index)
    trigger(OwnerPolicyStepFields.owners)
  }

  const isDisabled = !formState.isValid

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
    <form data-testid="owner-policy-step-form" onSubmit={onFormSubmit} id={OWNER_POLICY_STEP_FORM_ID}>
      <FormProvider {...formMethods}>
        <Box data-sid="40090" className={layoutCss.row}>
          {ownerFields.map((field, i) => (
            <OwnerRow
              key={field.id}
              index={i}
              removable={i > 0}
              groupName={OwnerPolicyStepFields.owners}
              remove={removeOwner}
            />
          ))}
          <Button
            data-sid="52167"
            data-testid="add-owner-btn"
            variant="text"
            onClick={() => appendOwner({ name: '', address: '' }, { shouldFocus: true })}
            startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
            size="large"
          >
            Add new owner
          </Button>
          <Box data-sid="75862" p={2} mt={3} sx={{ backgroundColor: 'background.main', borderRadius: '8px' }}>
            <Typography variant="subtitle1" fontWeight={700} display="inline-flex" alignItems="center" gap={1}>
              {'Safe{Wallet}'} mobile owner key (optional){' '}
              <Tooltip
                title="The Safe{Wallet} mobile app allows for the generation of owner keys that you can add to this or an existing Safe Account."
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
        <Box data-sid="53880" className={layoutCss.row}>
          <Typography variant="h4" fontWeight={700} display="inline-flex" alignItems="center" gap={1}>
            Threshold
            <Tooltip
              title="The threshold of a Safe Account specifies how many owners need to confirm a Safe Account transaction before it can be executed."
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
          <Grid container direction="row" alignItems="center" gap={2} pt={1}>
            <Grid item>
              <Controller
                control={control}
                name="threshold"
                render={({ field }) => (
                  <TextField select {...field}>
                    {ownerFields.map((_, idx) => (
                      <MenuItem key={idx + 1} value={idx + 1}>
                        {idx + 1}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item>
              <Typography>out of {ownerFields.length} owner(s)</Typography>
            </Grid>
          </Grid>

          {ownerFields.length > 1 && <CounterfactualHint />}
        </Box>
        <Divider />
        <Box data-sid="92826" className={layoutCss.row}>
          <Box data-sid="55053" display="flex" flexDirection="row" justifyContent="space-between" gap={3}>
            <Button
              data-sid="54771"
              data-testid="back-btn"
              variant="outlined"
              size="small"
              onClick={handleBack}
              startIcon={<ArrowBackIcon fontSize="small" />}
            >
              Back
            </Button>
            <Button
              data-sid="58357"
              data-testid="next-btn"
              type="submit"
              variant="contained"
              size="stretched"
              disabled={isDisabled}
            >
              Next
            </Button>
          </Box>
        </Box>
      </FormProvider>
    </form>
  )
}

export default OwnerPolicyStep
