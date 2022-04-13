import { useEffect, useState } from 'react'

type AsyncResult<T> = [
  result: T | undefined,
  error: Error | undefined,
  loading: boolean,
]

const useAsync = <T>(asyncCall: () => Promise<T>): AsyncResult<T> => {
  const [result, setResult] = useState<T>()
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isCurrent = true

    setResult(undefined)
    setError(undefined)
    setLoading(true)

    asyncCall()
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
  }, [asyncCall])

  return [ result, error, loading ]
}

export default useAsync
