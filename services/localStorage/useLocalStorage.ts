import { useState, useEffect, useCallback } from 'react'
import local from './local'

const useLocalStorage = <T>(key: string): [T | undefined, (val: T | undefined) => void] => {
  const [cache, setCache] = useState<T>()

  useEffect(() => {
    const saved = local.getItem<T>(key)
    setCache(saved)
  }, [key])

  const setNewValue = useCallback(
    (newVal: T | undefined) => {
      setCache(newVal)
      local.setItem<T | undefined>(key, newVal)
    },
    [setCache, key],
  )

  return [cache, setNewValue]
}

export default useLocalStorage
