/* eslint-disable @typescript-eslint/no-empty-function */

import { useRouter } from 'next/router'
import { createContext, Suspense, useContext, useState } from 'react'
import type { JSXElementConstructor, LazyExoticComponent, ReactElement, Dispatch, SetStateAction } from 'react'

import { AppRoutes } from '@/config/routes'
import { ProgressBar } from '@/components/common/ProgressBar'

export const createStepper = <StepperState extends Record<string, unknown>>({
  steps,
  state,
}: {
  steps: LazyExoticComponent<() => ReactElement<any, string | JSXElementConstructor<any>>>[]
  state?: StepperState
}) => {
  // Typed context
  const Context = createContext<{
    stepperState: StepperState | undefined
    setStepperState: Dispatch<SetStateAction<StepperState | undefined>>
    activeStep: number
    setActiveStep: Dispatch<SetStateAction<number>>
    onBack: () => void
    onNext: () => void
    progress: number
  }>({
    stepperState: undefined,
    setStepperState: () => {},
    activeStep: 0,
    setActiveStep: () => {},
    onBack: () => {},
    onNext: () => {},
    progress: 0,
  })

  // Typed Provider
  const Stepper = () => {
    const router = useRouter()

    const [stepperState, setStepperState] = useState(state)

    const [activeStep, setActiveStep] = useState(0)

    const onBack = () => {
      if (activeStep > 0) {
        setActiveStep(activeStep - 1)
      }
    }

    const onNext = () => {
      if (activeStep < steps.length - 1) {
        setActiveStep(activeStep + 1)
      } else {
        router.push(AppRoutes.index)
      }
    }

    const progress = ((activeStep + 1) / steps.length) * 100

    const Step = steps[activeStep]

    return (
      <Context.Provider
        value={{
          stepperState,
          setStepperState,
          activeStep,
          setActiveStep,
          onBack,
          onNext,
          progress,
        }}
      >
        <Suspense>
          <ProgressBar value={progress} />
          <Step />
        </Suspense>
      </Context.Provider>
    )
  }

  const useStepper = () => {
    const stepperContext = useContext(Context)

    if (!stepperContext) {
      throw new Error('useStepper must be used within a Stepper')
    }

    return stepperContext
  }

  return {
    Stepper,
    useStepper,
  }
}
