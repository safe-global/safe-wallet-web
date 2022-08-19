import { useCallback, useEffect, useState } from 'react'

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
    clearData && setData(undefined)
    setError(undefined)

    const promise = callback()

    // Not a promise, exit early
    if (!promise) {
      setLoading(false)
      return
    }

    let isCurrent = true
    setLoading(true)

    promise
      .then((val: T) => {
        isCurrent && setData(val)
      })
      .catch((err) => {
        isCurrent && setError(err)
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
