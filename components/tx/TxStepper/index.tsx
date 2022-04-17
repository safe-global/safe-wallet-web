import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Button from '@mui/material/Button'

export type TxStepperProps = {
  steps: Array<{
    label: string
    render: (onSubmit: (data: unknown) => void, data: unknown) => ReactElement
  }>
  initialStepData?: unknown[]
}

const TxStepper = ({ steps, initialStepData }: TxStepperProps): ReactElement => {
  const [activeStep, setActiveStep] = useState<number>(0)
  const [stepData, setStepData] = useState<Array<unknown>>(initialStepData || [])

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
  }

  const onSubmit = (data: unknown) => {
    const allData = [...stepData]
    allData[activeStep + 1] = data
    setStepData(allData)
    handleNext()
  }

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

      {steps[activeStep].render(onSubmit, stepData[activeStep])}

      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        {activeStep === steps.length - 1 ? (
          <>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleReset}>Create another transaction</Button>
          </>
        ) : (
          <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
            Back
          </Button>
        )}
      </Box>
    </Box>
  )
}

export default TxStepper
