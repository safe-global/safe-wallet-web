import { useCallback, useEffect, useState } from 'react'

const useIntervalCounter = (interval: number): [number, () => void] => {
  const [counter, setCounter] = useState<number>(0)

  const resetCounter = useCallback(() => {
    setCounter(0)
  }, [setCounter])

  useEffect(() => {
    const intervalId = setInterval(() => setCounter(counter + 1), interval)
    return () => clearInterval(intervalId)
  }, [counter, interval])

  return [counter, resetCounter]
}

export default useIntervalCounter
