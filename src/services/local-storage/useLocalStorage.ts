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
  // This is the setter that will be returned
  // It will update the local storage and the cache
  const setNewValue = useCallback<Setter<T>>(
    (value) => {
      setStore((prevStore = {}) => {
        const prevVal = prevStore[key] as T
        const newVal = value instanceof Function ? value(prevVal) : value

        // Nothing to update
        if (prevVal === newVal) {
          return prevStore
        }

        // Update the local storage
        if (newVal === undefined) {
          local.removeItem(key)
        } else {
          local.setItem<T>(key, newVal)
        }

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

  // Get the current value from the cache, or fall back to the initial value
  const cache = useStore()
  const cachedVal = cache?.[key] as T
  const currentVal = cachedVal ?? initialValue

  return [currentVal, setNewValue]
}

export default useLocalStorage
