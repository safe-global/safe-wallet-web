import { useCallback, useEffect, useState } from 'react'
import local from './local'

// The setter accepts T or a function that takes the old value and returns T
// Mimics the behavior of useState
type Setter<T> = (val: (T | undefined) | ((prevVal: T | undefined) => T | undefined)) => void

const useLocalStorage = <T>(key: string): [T | undefined, Setter<T>] => {
  const [cache, setCache] = useState<T | undefined>()

  // This is the setter that will be returned
  // It will update the local storage and cache
  const setNewValue = useCallback<Setter<T>>(
    (value) => {
      setCache((oldValue) => {
        const newValue = value instanceof Function ? value(oldValue) : value

        if (newValue !== oldValue) {
          local.setItem(key, newValue)

          // Dispatch a fake storage event within the current browser tab
          // The real storage event is dispatched only in other tabs
          window.dispatchEvent(
            new StorageEvent('storage', {
              key: local.getPrefixedKey(key),
            }),
          )
        }

        return newValue
      })
    },
    [key],
  )

  // Subscribe to changes in local storage and update the cache
  // This will work across tabs
  useEffect(() => {
    const onStorageEvent = (event: StorageEvent) => {
      if (event.key === local.getPrefixedKey(key)) {
        setCache(local.getItem<T>(key))
      }
    }

    // Subscribe to storage events from othet tabs and this tab
    window.addEventListener('storage', onStorageEvent)

    return () => {
      window.removeEventListener('storage', onStorageEvent)
    }
  }, [key])

  // Set the initial value when the component is mounted
  // Ignore undefined to avoid overwriting the externally passed inital value
  useEffect(() => {
    const lsValue = local.getItem<T>(key)
    if (lsValue !== undefined) {
      setCache(lsValue)
    }
  }, [key])

  return [cache, setNewValue]
}

export default useLocalStorage
