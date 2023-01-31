import type { ReactElement } from 'react'
import { useState } from 'react'
import { trackEvent, MODALS_CATEGORY } from '@/services/analytics'
import { merge } from 'lodash'

export type StepRenderProps = {
  data: unknown
  onSubmit: (data?: unknown) => void
  onBack: (data?: unknown) => void
  setStep: (step: number) => void
}

type Step = {
  // `label` is either a string, or a dynamic render function that takes the current data
  // E.g. to render a Safe App icon in the modal header
  label: ((data: StepRenderProps['data']) => ReactElement) | string
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
  eventCategory?: string
  onClose: () => void
}

export const useTxStepper = ({
  steps,
  initialData,
  initialStep,
  eventCategory = MODALS_CATEGORY,
  onClose,
}: TxStepperProps) => {
  const [activeStep, setActiveStep] = useState<number>(initialStep || 0)
  const [stepData, setStepData] = useState<Array<unknown>>(initialData || [])

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
    trackEvent({ category: eventCategory, action: lastStep ? 'Submit' : 'Next', label: activeStep })
  }

  const handleBack = (data?: unknown) => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
    trackEvent({ category: eventCategory, action: firstStep ? 'Cancel' : 'Back', label: activeStep })

    if (data) {
      updateStepData(data)
    }
  }

  const updateStepData = (data: unknown) => {
    const allData = [...stepData]
    allData[activeStep] = data
    allData[activeStep + 1] = merge(allData[activeStep + 1], data)
    setStepData(allData)
  }

  const setStep = (step: number) => {
    setActiveStep(step)
  }

  const firstStep = activeStep === 0
  const lastStep = activeStep === steps.length - 1

  const onBack = firstStep ? onClose : handleBack

  const onSubmit = (data: unknown) => {
    if (lastStep) {
      onClose()
      return
    }
    updateStepData(data)
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
