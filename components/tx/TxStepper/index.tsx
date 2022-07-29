import { ReactElement } from 'react'
import { DialogTitle, Button, Box, DialogActions, Typography } from '@mui/material'
import { TxStepperProps, useTxStepper } from '@/components/tx/TxStepper/useTxStepper'
import css from './styles.module.css'

const TxStepper = ({ steps, initialData, initialStep, onClose }: TxStepperProps): ReactElement => {
  const { onBack, onSubmit, setStep, activeStep, stepData, firstStep } = useTxStepper({
    steps,
    initialData,
    initialStep,
    onClose,
  })

  return (
    <Box className={css.container}>
      <DialogTitle display="flex" alignItems="center" justifyContent="space-between">
        {steps[activeStep].label}

        <Typography color={({ palette }) => palette.text.secondary}>
          Step {activeStep + 1} out of {steps.length}
        </Typography>
      </DialogTitle>

      {steps[activeStep].render(stepData[Math.max(0, activeStep)], onSubmit, onBack, setStep)}

      <DialogActions>
        <Button color="inherit" onClick={onBack}>
          {firstStep ? 'Cancel' : 'Back'}
        </Button>
      </DialogActions>
    </Box>
  )
}

export default TxStepper
