import type { Middleware, PreloadedState } from '@reduxjs/toolkit'

import local from '@/services/localStorage/local'
import type { RootState } from '@/store'

type PreloadedRootState = PreloadedState<RootState>

export const preloadState = <K extends keyof PreloadedRootState>(sliceNames: K[]): PreloadedRootState => {
  const preloadedState: PreloadedRootState = {}

  for (const sliceName of sliceNames) {
    const sliceState = local.getItem<PreloadedRootState[K]>(sliceName)

    if (sliceState) {
      preloadedState[sliceName] = sliceState
    }
  }

  return preloadedState
}

export const persistState = <K extends keyof PreloadedRootState>(sliceNames: K[]): Middleware<{}, RootState> => {
  return (store) => (next) => (action) => {
    const result = next(action)

    const state = store.getState()

    for (const sliceName of sliceNames) {
      const sliceState = state[sliceName]

      if (sliceState) {
        local.setItem(sliceName, sliceState)
      } else {
        local.removeItem(sliceName)
      }
    }

    return result
  }
}
