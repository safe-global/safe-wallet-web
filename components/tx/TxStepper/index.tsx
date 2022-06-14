import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Button from '@mui/material/Button'
import { TxStepperProps, useTxStepper } from '@/components/tx/TxStepper/useTxStepper'

const TxStepper = ({ steps, initialData, onClose }: TxStepperProps): ReactElement => {
  const { onBack, onSubmit, activeStep, stepData, firstStep } = useTxStepper({ steps, initialData, onClose })

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map(({ label }) => {
          const stepProps: { completed?: boolean } = {}

          return (
            <Step key={label} {...stepProps}>
              <StepLabel>{label}</StepLabel>
            </Step>
          )
        })}
      </Stepper>

      <Box sx={{ padding: '30px 0' }}>
        {steps[activeStep].render(stepData[Math.max(0, activeStep - 1)], onSubmit, onBack)}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Button color="inherit" onClick={onBack} sx={{ mr: 1 }}>
          {firstStep ? 'Cancel' : 'Back'}
        </Button>
      </Box>
    </Box>
  )
}

export default TxStepper
