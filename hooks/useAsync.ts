import { useCallback, useEffect, useState } from 'react'

export type AsyncResult<T> = [result: T | undefined, error: Error | undefined, loading: boolean]

const useAsync = <T>(asyncCall: () => Promise<T>, dependencies: unknown[], clearData = true): AsyncResult<T> => {
  const [data, setData] = useState<T | undefined>()
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState<boolean>(true)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callback = useCallback(asyncCall, dependencies)

  useEffect(() => {
    let isCurrent = true

    clearData && setData(undefined)
    setError(undefined)
    setLoading(true)

    callback()
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
