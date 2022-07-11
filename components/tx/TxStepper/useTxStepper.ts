import { ReactElement, useState } from 'react'

export type StepRenderProps = {
  data: unknown
  onSubmit: (data: unknown) => void
  onBack: () => void
}

type Step = {
  label: string
  render: (
    data: StepRenderProps['data'],
    onSubmit: StepRenderProps['onSubmit'],
    onBack: StepRenderProps['onBack'],
  ) => ReactElement
}

export type TxStepperProps = {
  steps: Array<Step>
  initialData?: unknown[]
  onClose: () => void
  onFinish?: () => void
}

export const useTxStepper = ({ steps, initialData, onClose, onFinish }: TxStepperProps) => {
  const [activeStep, setActiveStep] = useState<number>(0)
  const [stepData, setStepData] = useState<Array<unknown>>(initialData || [])

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const firstStep = activeStep === 0
  const lastStep = activeStep === steps.length - 1

  const onBack = firstStep ? onClose : handleBack

  const onSubmit = (data: unknown) => {
    if (lastStep) {
      onFinish ? onFinish() : onClose()
      return
    }
    const allData = [...stepData]
    allData[activeStep] = data
    if (!allData[activeStep + 1]) {
      allData[activeStep + 1] = data
    }
    setStepData(allData)
    handleNext()
  }

  return {
    onBack,
    onSubmit,
    activeStep,
    stepData,
    firstStep,
  }
}
