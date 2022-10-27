import { useCallback, useEffect, useState } from 'react'
import local from './local'

// The setter accepts T or a function that takes the old value and returns T
// Mimics the behavior of useState
type Undefinable<T> = T | undefined

type Setter<T> = (val: T | ((prevVal: Undefinable<T>) => Undefinable<T>)) => void

const useLocalStorage = <T>(key: string, initialValue?: T): [Undefinable<T>, Setter<T>] => {
  const [cache, setCache] = useState<Undefinable<T>>(initialValue)

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

  // On mount, sync the cache with the local storage
  useEffect(() => {
    const lsValue = local.getItem<T>(key)
    if (lsValue !== null) {
      setCache(lsValue)
    }
  }, [key])

  // Save initial value to the LS
  useEffect(() => {
    if (initialValue !== undefined && local.getItem(key) === null) {
      local.setItem(key, initialValue)
    }
  }, [key, initialValue])

  // Subscribe to changes in local storage and update the cache
  // This will work across tabs
  useEffect(() => {
    const onStorageEvent = (event: StorageEvent) => {
      if (event.key === local.getPrefixedKey(key)) {
        const lsValue = local.getItem<T>(key)
        setCache(lsValue ?? undefined)
      }
    }

    window.addEventListener('storage', onStorageEvent)

    return () => {
      window.removeEventListener('storage', onStorageEvent)
    }
  }, [key])

  return [cache, setNewValue]
}

export default useLocalStorage
