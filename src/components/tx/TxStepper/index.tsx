import type { ReactElement } from 'react'
import React from 'react'
import { Button, DialogActions, Grid, Typography } from '@mui/material'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import { useTxStepper } from '@/components/tx/TxStepper/useTxStepper'
import css from './styles.module.css'
import { ModalDialogTitle } from '@/components/common/ModalDialog'

const TxStepper = ({ steps, initialData, initialStep, onClose }: TxStepperProps): ReactElement => {
  const { onBack, onSubmit, setStep, activeStep, stepData, firstStep } = useTxStepper({
    steps,
    initialData,
    initialStep,
    onClose,
  })

  const activeLabel = steps[activeStep].label
  const activeStepData = stepData[Math.max(0, activeStep)]

  return (
    <div className={css.container}>
      <ModalDialogTitle onClose={onClose}>
        <Grid container px={1} alignItems="center" gap={2}>
          <Grid item>{typeof activeLabel === 'string' ? activeLabel : activeLabel(activeStepData)}</Grid>

          {steps.length > 1 && (
            <Grid item>
              <Typography className={css.stepIndicator} variant="caption" color="border.main">
                Step {activeStep + 1} out of {steps.length}
              </Typography>
            </Grid>
          )}
        </Grid>
      </ModalDialogTitle>

      {steps[activeStep].render(activeStepData, onSubmit, onBack, setStep)}

      <DialogActions>
        <Button color="inherit" onClick={() => onBack()}>
          {firstStep ? 'Cancel' : 'Back'}
        </Button>
      </DialogActions>
    </div>
  )
}

export default TxStepper
