import { useCallback, useEffect, useState } from 'react'

const useIntervalCounter = (interval: number): [number, () => void] => {
  const [counter, setCounter] = useState<number>(0)

  const resetCounter = useCallback(() => {
    setCounter(0)
  }, [setCounter])

  useEffect(() => {
    const timerId = setTimeout(() => setCounter(counter + 1), interval)
    return () => clearTimeout(timerId)
  }, [counter, interval])

  return [counter, resetCounter]
}

export default useIntervalCounter
