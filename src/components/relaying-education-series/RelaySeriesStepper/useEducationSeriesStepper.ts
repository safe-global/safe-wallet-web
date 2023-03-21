import { useState, type ReactElement } from 'react'

export type StepRenderProps = {
  onBack: () => void
  onNext: () => void
  onClose: () => void
}

type Step = {
  title: string
  render: (
    onBack: StepRenderProps['onBack'],
    onNext: StepRenderProps['onNext'],
    onClose: StepRenderProps['onClose'],
  ) => ReactElement
}

export type EducationSeriesStepperProps = {
  steps: Array<Step>
  onClose: () => void
}

const useEducationSeriesStepper = ({ steps, onClose }: EducationSeriesStepperProps) => {
  const [activeStep, setActiveStep] = useState<number>(0)
  const lastStep = activeStep === steps.length - 1

  const onNext = () => {
    if (lastStep) {
      onClose()
      return
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const onBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const setStep = (step: number) => {
    setActiveStep(step)
  }

  return {
    onBack,
    onNext,
    activeStep,
    setStep,
    onClose,
  }
}

export default useEducationSeriesStepper
