import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import local from './local'

const useLocalStorage = <T>(key: string): [T | undefined, Dispatch<SetStateAction<T | undefined>>] => {
  const [cache, setCache] = useState<T>()

  useEffect(() => {
    const saved = local.getItem<T>(key)
    setCache(saved)
  }, [key, setCache])

  useEffect(() => {
    local.setItem<T | undefined>(key, cache)
  }, [key, cache])

  return [cache, setCache]
}

export default useLocalStorage
