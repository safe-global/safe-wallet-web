import { useEffect, useState } from 'react'

export const useCounter = (startTimestamp: number | undefined) => {
  const [counter, setCounter] = useState<number>()

  useEffect(() => {
    const update = () => {
      if (startTimestamp) {
        setCounter(Math.floor((Date.now() - startTimestamp) / 1000))
      }
    }

    const interval = setInterval(update, 1000)

    return () => clearInterval(interval)
  }, [startTimestamp])

  return counter
}
