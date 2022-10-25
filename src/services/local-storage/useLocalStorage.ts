import { useCallback, useEffect } from 'react'
import ExternalStore from '../ExternalStore'
import local from './local'

// This store is a record whose keys correspond to the keys of the local storage
// It's basically a global cache of the local storage
// When a value is updated, all instances of the hook below will be updated
const { setStore, useStore } = new ExternalStore<Record<string, unknown>>()

// The setter accepts T or a function that takes the old value and returns T
// Mimics the behavior of useState
type Setter<T> = (val: T | undefined | ((prevVal: T) => T | undefined)) => void

const useLocalStorage = <T>(key: string, initialValue: T): [T, Setter<T>] => {
  // Get the current value from the cache, or fall back to the initial value
  const cache = useStore()
  const cachedVal = cache?.[key] as T
  const currentVal = cachedVal ?? initialValue

  // This is the setter that will be returned
  // It will update the local storage and the cache
  const setNewValue = useCallback<Setter<T>>(
    (value) => {
      setStore((prevStore = {}) => {
        const prevVal = prevStore[key] as T
        const newVal = value instanceof Function ? value(prevVal) : value

        // Nothing to update
        if (prevVal === newVal) return prevStore

        // Update the cache
        return {
          ...prevStore,
          [key]: newVal,
        }
      })
    },
    [key],
  )

  // Read the initial local storage value and put it in the cache
  useEffect(() => {
    setNewValue((prevVal) => prevVal ?? local.getItem<T>(key))
  }, [key, setNewValue])

  return [currentVal, setNewValue]
}

export default useLocalStorage

export const useSyncLocalStorage = () => {
  const cache = useStore()

  useEffect(() => {
    if (!cache) return

    // Update the local storage when the cache changes
    Object.entries(cache).forEach(([key, value]) => {
      // Update the local storage
      if (value === undefined) {
        local.removeItem(key)
      } else {
        local.setItem(key, value)
      }
    })
  }, [cache])
}
