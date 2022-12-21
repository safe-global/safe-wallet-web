import type { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import { StepContent } from '@mui/material'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import { useTxStepper } from '@/components/tx/TxStepper/useTxStepper'

const VerticalTxStepper = ({
  steps,
  initialData,
  initialStep,
  onClose,
  eventCategory,
}: TxStepperProps): ReactElement => {
  const { onBack, onSubmit, setStep, activeStep, stepData } = useTxStepper({
    steps,
    initialData,
    initialStep,
    onClose,
    eventCategory,
  })

  return (
    <Box width={1}>
      <Stepper activeStep={activeStep} orientation="vertical" className={`active-${activeStep}`}>
        {steps.map(({ label, render }, index) => {
          return (
            <Step key={index}>
              <StepLabel>{typeof label === 'string' ? label : label(stepData[index])}</StepLabel>
              <StepContent>{render(stepData[index], onSubmit, onBack, setStep)}</StepContent>
            </Step>
          )
        })}
      </Stepper>
    </Box>
  )
}

export default VerticalTxStepper
