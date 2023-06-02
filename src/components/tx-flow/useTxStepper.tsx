import { useCallback, useState } from 'react'

const useTxStepper = <T extends Array<any>>(initialData: T) => {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<T>(initialData)

  const nextStep = useCallback(<S extends keyof T>(stepData: T[S]) => {
    setStep((prevStep) => {
      const newStep = prevStep + 1
      setData((prevData) => ({ ...prevData, [newStep]: stepData }))
      return newStep
    })
  }, [])

  const prevStep = useCallback(() => {
    setStep((prevStep) => prevStep - 1)
  }, [])

  return { step, data, nextStep, prevStep }
}

export default useTxStepper
