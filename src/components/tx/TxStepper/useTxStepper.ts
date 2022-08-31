import { ReactElement, useState } from 'react'
import { trackEvent, MODALS_CATEGORY } from '@/services/analytics'

export type StepRenderProps = {
  data: unknown
  onSubmit: (data: unknown) => void
  onBack: () => void
  setStep: (step: number) => void
}

type Step = {
  label: string
  render: (
    data: StepRenderProps['data'],
    onSubmit: StepRenderProps['onSubmit'],
    onBack: StepRenderProps['onBack'],
    setStep: StepRenderProps['setStep'],
  ) => ReactElement
}

export type TxStepperProps = {
  steps: Array<Step>
  initialData?: unknown[]
  initialStep?: number
  onClose: () => void
  onFinish?: () => void
}

export const useTxStepper = ({ steps, initialData, initialStep, onClose, onFinish }: TxStepperProps) => {
  const [activeStep, setActiveStep] = useState<number>(initialStep || 0)
  const [stepData, setStepData] = useState<Array<unknown>>(initialData || [])

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
    trackEvent({ category: MODALS_CATEGORY, action: lastStep ? 'Submit' : 'Next' })
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
    trackEvent({ category: MODALS_CATEGORY, action: firstStep ? 'Cancel' : 'Back' })
  }

  const setStep = (step: number) => {
    setActiveStep(step)
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
    allData[activeStep + 1] = data
    setStepData(allData)
    handleNext()
  }

  return {
    onBack,
    onSubmit,
    setStep,
    activeStep,
    stepData,
    firstStep,
  }
}
