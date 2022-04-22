import { useCallback, useEffect, useState } from 'react'

type AsyncResult<T> = [result: T | undefined, error: Error | undefined, loading: boolean]

const useAsync = <T>(asyncCall: () => Promise<T>, dependencies: unknown[]): AsyncResult<T> => {
  const [result, setResult] = useState<T>()
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState<boolean>(true)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const callback = useCallback(asyncCall, dependencies)

  useEffect(() => {
    let isCurrent = true

    setResult(undefined)
    setError(undefined)
    setLoading(true)

    callback()
      .then((val: T) => {
        isCurrent && setResult(val)
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
  }, [callback])

  return [result, error, loading]
}

export default useAsync
