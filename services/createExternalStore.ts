import { useSyncExternalStore } from 'react'

// Singleton with getter/setter whose hook triggers a re-render
const createExternalStore = <T extends unknown>(initialValue?: T) => {
  let _store = initialValue
  const listeners = new Set<() => void>()

  const getStore = () => _store

  const setStore = (value: T) => {
    _store = value
    listeners.forEach((listener) => listener())
  }

  const useStore = () =>
    useSyncExternalStore(
      (listener: () => void) => {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
      getStore,
      getStore,
    )

  return {
    getStore,
    setStore,
    useStore,
  }
}

export default createExternalStore
