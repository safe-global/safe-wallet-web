import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { TxStepperProps, useTxStepper } from '@/components/tx/TxStepper/useTxStepper'
import { DialogActions, Typography } from '@mui/material'
import css from './styles.module.css'

const TxStepper = ({ steps, initialData, initialStep, onClose }: TxStepperProps): ReactElement => {
  const { onBack, onSubmit, setStep, activeStep, stepData, firstStep } = useTxStepper({
    steps,
    initialData,
    initialStep,
    onClose,
  })

  return (
    <Box margin={3} className={css.container}>
      <Box py={1}>
        <Box className={css.stepIndicator} py={0.5}>
          <Typography color={({ palette }) => palette.text.secondary}>
            Step {activeStep + 1} out of {steps.length}
          </Typography>
        </Box>

        {steps[activeStep].render(stepData[Math.max(0, activeStep)], onSubmit, onBack, setStep)}
      </Box>

      <DialogActions sx={{ m: -3, mt: 3 }}>
        <Button color="inherit" onClick={onBack}>
          {firstStep ? 'Cancel' : 'Back'}
        </Button>
      </DialogActions>
    </Box>
  )
}

export default TxStepper
