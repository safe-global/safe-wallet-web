import { Middleware } from '@reduxjs/toolkit'

import local from '@/services/localStorage/local'
import { RootState } from '@/store'

export const preloadState = (slices: (keyof RootState)[]) => {
  const preloadedState: Record<string, unknown> = {}

  for (const slice of slices) {
    // Filter typeof $CombinedState
    if (typeof slice !== 'string') {
      continue
    }

    const state = local.getItem(slice)

    if (state) {
      preloadedState[slice] = state
    }
  }

  return preloadedState
}

export const persistState = (slices: (keyof RootState)[]): Middleware<{}, RootState> => {
  return (store) => (next) => (action) => {
    const result = next(action)

    const _state = store.getState()

    for (const slice of slices) {
      // Filter typeof $CombinedState
      if (typeof slice !== 'string') {
        continue
      }

      const state = _state[slice]

      if (state) {
        local.setItem(slice, state)
      } else {
        local.removeItem(slice)
      }
    }

    return result
  }
}
