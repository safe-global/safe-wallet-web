import { useState, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'

export const useDeferredListener = <T>({
  listener,
  cb,
  ms,
}: {
  listener?: (handler: (e: T) => void) => () => void
  cb?: () => void
  ms: number
}): [T | undefined, Dispatch<SetStateAction<T | undefined>>] => {
  const [value, setValue] = useState<T>()

  useEffect(() => {
    if (!listener) {
      return
    }

    const unsubscribe = listener((newValue) => {
      setValue(newValue)
      cb?.()
    })

    const timeout = setTimeout(() => {
      setValue(undefined)
    }, ms)

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [cb, listener, ms])

  return [value, setValue]
}
