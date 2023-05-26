import merge from 'lodash/merge'
import { createContext, Suspense, useCallback, useContext, useState } from 'react'
import type { JSXElementConstructor, ReactElement, Dispatch, SetStateAction } from 'react'

type Object = Record<string, unknown>

type MergeObjects<T extends Array<Object>> = T extends [a: infer A, ...rest: infer R]
  ? R extends Array<Object>
    ? A & MergeObjects<R>
    : never
  : {}

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

type ContextProps<T extends Array<Object>> = {
  activeStep: number
  setActiveStep: Dispatch<SetStateAction<number>>
  progress: number
  stepValues: Object
  defaultValues: T[number]
  mergedValues: Expand<MergeObjects<T>>
  onBack: () => void
  onSubmit: (stepValues: T[number]) => void
}

const DEFAULT_ACTIVE_STEP = 0

export const createStepper = <T extends Array<Object>>() => {
  // Typed context
  const Context = createContext<ContextProps<T>>({
    activeStep: DEFAULT_ACTIVE_STEP,
    setActiveStep: () => {},
    progress: 0,
    stepValues: {},
    defaultValues: {} as T[number],
    mergedValues: {} as Expand<MergeObjects<T>>,
    onBack: () => {},
    onSubmit: () => {},
  })

  // Typed Provider
  const Provider = <S extends ReactElement<any, string | JSXElementConstructor<any>>>({
    onClose,
    steps,
    defaultValues,
    children,
  }: {
    onClose?: () => void
    steps: S[]
    defaultValues: T
    children?: (Step: S, values: ContextProps<T>) => ReactElement
  }) => {
    const [activeStep, setActiveStep] = useState(DEFAULT_ACTIVE_STEP)
    const [values, setValues] = useState<T>(defaultValues)

    const mergedValues: Expand<MergeObjects<T>> = merge({}, ...values)

    const onBack = useCallback(() => {
      const isFirstStep = activeStep === DEFAULT_ACTIVE_STEP
      if (isFirstStep) {
        onClose?.()
        return
      }

      setActiveStep(activeStep - 1)
    }, [activeStep, onClose])

    const onSubmit = (stepValues: T[number]) => {
      const isLastStep = activeStep === steps.length - 1
      if (isLastStep) {
        onClose?.()
        return
      }

      setValues((prevValues) => {
        prevValues[activeStep] = stepValues
        return prevValues
      })

      setActiveStep((prevStep) => prevStep + 1)
    }

    const progress = ((activeStep + 1) / steps.length) * 100

    const Step = steps[activeStep]

    const providerValues: ContextProps<T> = {
      activeStep,
      setActiveStep,
      progress,
      stepValues: values[activeStep],
      defaultValues: defaultValues[activeStep],
      mergedValues,
      onBack,
      onSubmit,
    }

    return (
      <Context.Provider value={providerValues}>
        <Suspense>{children ? children(Step, providerValues) : Step}</Suspense>
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
    Provider,
    Context,
  }
}
