import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Button from '@mui/material/Button'
import SendAssetsForm from '../SendAssetsForm'
import ReviewTx from '../ReviewTx'
import SignTx from '../SignTx'
import ExecuteTx from '../ExecuteTx'

const steps = ['Create transaction', 'Review transaction', 'Sign transaction']

const TxStepper = (): ReactElement => {
  const [activeStep, setActiveStep] = useState<number>(0)
  const [stepData, setStepData] = useState<unknown>()

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
    setStepData(data)
    handleNext()
  }

  const stepComponents = [
    () => <SendAssetsForm onSubmit={onSubmit} />,

    () => <ReviewTx data={stepData} onSubmit={onSubmit} />,

    () => <SignTx data={stepData} onSubmit={onSubmit} />,

    () => <ExecuteTx data={stepData} />,
  ]

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => {
          const stepProps: { completed?: boolean } = {}

          return (
            <Step key={label} {...stepProps}>
              <StepLabel>{label}</StepLabel>
            </Step>
          )
        })}
      </Stepper>

      {stepComponents[activeStep]()}

      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        {activeStep === steps.length ? (
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
