import type { ReactElement } from 'react'
import { useState } from 'react'
import { trackEvent, MODALS_CATEGORY } from '@/services/analytics'

export type StepRenderProps<TData> = {
  data: TData
  onSubmit: (data: Partial<TData>) => void
  onBack: (data?: Partial<TData>) => void
  setStep: (step: number) => void
}

export type Step<TData> = {
  title: string
  subtitle: string
  render: (
    data: StepRenderProps<TData>['data'],
    onSubmit: StepRenderProps<TData>['onSubmit'],
    onBack: StepRenderProps<TData>['onBack'],
    setStep: StepRenderProps<TData>['setStep'],
  ) => ReactElement
}

export type TxStepperProps<TData> = {
  steps: Array<Step<TData>>
  initialData: TData
  initialStep?: number
  eventCategory?: string
  onClose: () => void
}

export const useCardStepper = <TData>({
  steps,
  initialData,
  initialStep,
  eventCategory = MODALS_CATEGORY,
  onClose,
}: TxStepperProps<TData>) => {
  const [activeStep, setActiveStep] = useState<number>(initialStep || 0)
  const [stepData, setStepData] = useState(initialData)

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
    trackEvent({ category: eventCategory, action: lastStep ? 'Submit' : 'Next' })
  }

  const handleBack = (data?: Partial<TData>) => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
    trackEvent({ category: eventCategory, action: firstStep ? 'Cancel' : 'Back' })

    if (data) {
      setStepData((previous) => ({ ...previous, data }))
    }
  }

  const setStep = (step: number) => {
    setActiveStep(step)
  }

  const firstStep = activeStep === 0
  const lastStep = activeStep === steps.length - 1

  const onBack = firstStep ? onClose : handleBack

  const onSubmit = (data: Partial<TData>) => {
    if (lastStep) {
      onClose()
      return
    }
    setStepData((previous) => ({ ...previous, data }))
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
