import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import { StepContent } from '@mui/material'
import { TxStepperProps, useTxStepper } from '@/components/tx/TxStepper/useTxStepper'

const VerticalTxStepper = ({ steps, initialData, initialStep, onClose, onFinish }: TxStepperProps): ReactElement => {
  const { onBack, onSubmit, setStep, activeStep, stepData } = useTxStepper({
    steps,
    initialData,
    initialStep,
    onClose,
    onFinish,
  })

  return (
    <Box width={1}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map(({ label, render }, index) => {
          return (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>{render(stepData[index], onSubmit, onBack, setStep)}</StepContent>
            </Step>
          )
        })}
      </Stepper>
    </Box>
  )
}

export default VerticalTxStepper
