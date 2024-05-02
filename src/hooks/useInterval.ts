import { useRef, useEffect } from 'react'

/**
 * Run a callback function every {time} milliseconds
 * @param callback
 * @param time in milliseconds
 */
const useInterval = (callback: () => void, time: number) => {
  const callbackRef = useRef<() => void>()

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const interval = setInterval(() => callbackRef.current?.(), time)

    return () => clearInterval(interval)
  }, [time])
}

export default useInterval
