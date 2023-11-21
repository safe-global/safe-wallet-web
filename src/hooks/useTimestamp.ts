import { useState, useEffect } from 'react'

export function useTimestamp(interval = 1_000): number {
  const [timestamp, setTimestamp] = useState(Date.now())

  useEffect(() => {
    const timeout = setInterval(() => {
      setTimestamp((prev) => prev + interval)
    }, interval)

    return () => {
      clearInterval(timeout)
    }
  }, [interval])

  return timestamp
}
