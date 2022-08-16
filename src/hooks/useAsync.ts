import { useCallback, useEffect, useState } from 'react'

export type AsyncResult<T> = [result: T | undefined, error: Error | undefined, loading: boolean]

const useAsync = <T>(asyncCall: () => Promise<T>, dependencies: unknown[], clearData = true): AsyncResult<T> => {
  const [data, setData] = useState<T | undefined>()
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState<boolean>(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callback = useCallback(asyncCall, dependencies)

  useEffect(() => {
    let isCurrent = true

    clearData && setData(undefined)
    setError(undefined)

    // Mark as loading with a small timeout to avoid flashing the loading state for quickly resolved promises
    const loadingTimeout = setTimeout(() => {
      setLoading(true)
    }, 10)

    callback()
      .then((val: T) => {
        isCurrent && setData(val)
      })
      .catch((err) => {
        isCurrent && setError(err)
      })
      .finally(() => {
        clearTimeout(loadingTimeout)
        isCurrent && setLoading(false)
      })

    return () => {
      isCurrent = false
      clearTimeout(loadingTimeout)
    }
  }, [callback, clearData])

  return [data, error, loading]
}

export default useAsync
