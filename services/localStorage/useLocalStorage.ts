import { useState, useCallback, Dispatch, SetStateAction } from 'react'
import local from './local'

const useLocalStorage = <T>(key: string, initialState: T): [T, Dispatch<SetStateAction<T>>] => {
  const [cache, setCache] = useState<T>(local.getItem<T>(key) ?? initialState)

  const setNewValue = useCallback(
    (value: T | ((prevState: T) => T)) => {
      const newVal = value instanceof Function ? value(cache) : value
      setCache(newVal)
      local.setItem(key, newVal)
    },
    [setCache, key, cache],
  )

  return [cache, setNewValue]
}

export default useLocalStorage
