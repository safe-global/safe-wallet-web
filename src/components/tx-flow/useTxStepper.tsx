import { useCallback, useState } from 'react'

const useTxStepper = <T extends any>(initialData: T) => {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<T>(initialData)

  const nextStep = useCallback((data: T) => {
    setData(data)
    setStep((prevStep) => prevStep + 1)
  }, [])

  const prevStep = useCallback((data: T) => {
    setData(data)
    setStep((prevStep) => prevStep + 1)
  }, [])

  return { step, data, nextStep, prevStep }
}

export default useTxStepper
