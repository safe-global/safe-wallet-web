import { useCallback, useEffect, useState } from 'react'
import { asError } from '@/services/exceptions/utils'

export type AsyncResult<T> = [result: T | undefined, error: Error | undefined, loading: boolean]

const useAsync = <T>(
  asyncCall: () => Promise<T> | undefined,
  dependencies: unknown[],
  clearData = true,
): AsyncResult<T> => {
  const [data, setData] = useState<T | undefined>()
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState<boolean>(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callback = useCallback(asyncCall, dependencies)

  useEffect(() => {
    setError(undefined)

    const promise = callback()

    // Not a promise, exit early
    if (!promise) {
      setData(undefined)
      setLoading(false)
      return
    }

    let isCurrent = true
    clearData && setData(undefined)
    setLoading(true)

    promise
      .then((val: T) => {
        isCurrent && setData(val)
      })
      .catch((err) => {
        isCurrent && setError(asError(err))
      })
      .finally(() => {
        isCurrent && setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [callback, clearData])

  return [data, error, loading]
}

export default useAsync
