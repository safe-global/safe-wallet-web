import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Button from '@mui/material/Button'

type Step = {
  label: string
  render: (data: unknown, onSubmit: (data: unknown) => void, onClose: () => void) => ReactElement
}

export type TxStepperProps = {
  steps: Array<Step>
  initialData?: unknown[]
  onClose: () => void
}

const TxStepper = ({ steps, initialData, onClose }: TxStepperProps): ReactElement => {
  const [activeStep, setActiveStep] = useState<number>(0)
  const [stepData, setStepData] = useState<Array<unknown>>(initialData || [])

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const onSubmit = (data: unknown) => {
    if (activeStep === steps.length - 1) {
      onClose()
      return
    }
    const allData = [...stepData]
    allData[activeStep] = data
    setStepData(allData)
    handleNext()
  }

  const firstStep = activeStep === 0
  console.log('Active Step: ' + activeStep)

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
      {steps[activeStep].render(stepData[Math.max(0, activeStep - 1)], onSubmit, onClose)}
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Button color="inherit" onClick={firstStep ? onClose : handleBack} sx={{ mr: 1 }}>
          {firstStep ? 'Cancel' : 'Back'}
        </Button>
      </Box>
    </Box>
  )
}

export default TxStepper
