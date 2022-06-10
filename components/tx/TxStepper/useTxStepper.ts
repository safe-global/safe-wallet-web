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
}

export const useTxStepper = ({ steps, initialData, onClose }: TxStepperProps) => {
  const [activeStep, setActiveStep] = useState<number>(0)
  const [stepData, setStepData] = useState<Array<unknown>>(initialData || [])

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const firstStep = activeStep === 0

  const onBack = firstStep ? onClose : handleBack

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

  return {
    onBack,
    onSubmit,
    activeStep,
    stepData,
    firstStep,
  }
}
