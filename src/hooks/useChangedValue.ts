import { useEffect, useState } from 'react'

// Return the value only if it has been previously set to a non-falsy value
const useChangedValue = <T>(value: T): T | undefined => {
  const [_, setPrevValue] = useState<T>(value)
  const [newValue, setNewValue] = useState<T>()

  useEffect(() => {
    setPrevValue((prev) => {
      if (prev) {
        setNewValue(value)
      }
      return value
    })
  }, [value])

  return newValue
}

export default useChangedValue
