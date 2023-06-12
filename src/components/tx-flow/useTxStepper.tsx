import { useState } from 'react'
import merge from 'lodash/merge'

const useTxStepper = <T extends Array<unknown>>(initialData: T) => {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<T>(initialData)

  const nextStep = <S extends number>(stepData: T[S]) => {
    setStep((prevStep) => {
      const nextStep = prevStep + 1
      setData((prevData) => {
        prevData[prevStep] = stepData
        prevData[nextStep] = merge({}, prevData[nextStep], stepData)
        return prevData
      })
      return prevStep + 1
    })
  }

  const prevStep = () => {
    setStep((prevStep) => prevStep - 1)
  }

  return { step, data, nextStep, prevStep }
}

export default useTxStepper
