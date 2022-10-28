import type { Dispatch, SetStateAction } from 'react'
import { useState, useCallback } from 'react'
import local from './local'

/**
 * Locally persisted equivalent of `useState` that saves to `localStorage` when `setNewValue` is called
 * or (initially) when `shouldPersistInitialState` is `true`
 *
 * @param key `localStorage` key to store under
 * @param initialState default state to return if no `localStorage` value exists
 * @param shouldPersistInitialState if no `localStorage` value exists, persist the `initialState` in `localStorage`
 * @returns persisted state if it exists, otherwise `initialState`
 */

const useLocalStorage = <T>(
  key: string,
  initialState: T,
  shouldPersistInitialState = false,
): [T, Dispatch<SetStateAction<T>>] => {
  const [cache, setCache] = useState<T>(() => {
    const value = local.getItem<T>(key)

    if (value !== undefined) {
      return value
    }

    if (shouldPersistInitialState) {
      local.setItem(key, initialState)
    }

    return initialState
  })

  const setNewValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      setCache((prevState) => {
        const newState = value instanceof Function ? value(prevState) : value

        if (newState !== prevState) {
          local.setItem(key, newState)
        }

        return newState
      })
    },
    [setCache, key],
  )

  return [cache, setNewValue]
}

export default useLocalStorage
