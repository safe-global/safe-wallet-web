import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import Stepper, { Orientation } from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Button from '@mui/material/Button'
import { StepContent } from '@mui/material'

type Step = {
  label: string
  render: (data: unknown, onSubmit: (data: unknown) => void) => ReactElement
}

export type TxStepperProps = {
  steps: Array<Step>
  initialData?: unknown[]
  onClose: () => void
  orientation?: Orientation
}

const TxStepper = ({ steps, initialData, onClose, orientation = 'horizontal' }: TxStepperProps): ReactElement => {
  const [activeStep, setActiveStep] = useState<number>(0)
  const [stepData, setStepData] = useState<Array<unknown>>(initialData || [])

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const onSubmit = (data: unknown) => {
    const allData = [...stepData]
    allData[activeStep] = data
    setStepData(allData)
    handleNext()
  }

  const firstStep = activeStep === 0

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} orientation={orientation}>
        {steps.map(({ label }) => {
          const stepProps: { completed?: boolean } = {}

          return (
            <Step key={label} {...stepProps}>
              <StepLabel>{label}</StepLabel>
              {orientation === 'vertical' && (
                <StepContent>{steps[activeStep].render(stepData[Math.max(0, activeStep - 1)], onSubmit)}</StepContent>
              )}
            </Step>
          )
        })}
      </Stepper>

      {orientation === 'horizontal' && steps[activeStep].render(stepData[Math.max(0, activeStep - 1)], onSubmit)}

      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Button color="inherit" onClick={firstStep ? onClose : handleBack} sx={{ mr: 1 }}>
          {firstStep ? 'Cancel' : 'Back'}
        </Button>
      </Box>
    </Box>
  )
}

export default TxStepper
