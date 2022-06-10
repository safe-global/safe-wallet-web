import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import { StepContent } from '@mui/material'
import { TxStepperProps, useTxStepper } from '@/components/tx/TxStepper/useTxStepper'

const VerticalTxStepper = ({ steps, initialData, onClose }: TxStepperProps): ReactElement => {
  const { onBack, onSubmit, activeStep, stepData } = useTxStepper({ steps, initialData, onClose })

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map(({ label }) => {
          const stepProps: { completed?: boolean } = {}

          return (
            <Step key={label} {...stepProps}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {steps[activeStep].render(stepData[Math.max(0, activeStep - 1)], onSubmit, onBack)}
              </StepContent>
            </Step>
          )
        })}
      </Stepper>
    </Box>
  )
}

export default VerticalTxStepper
