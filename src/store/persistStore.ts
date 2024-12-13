import type { Middleware, PreloadedState } from '@reduxjs/toolkit'

import local from '@/services/local-storage/local'
import type { RootState } from '@/store'

type PreloadedRootState = PreloadedState<RootState>

export const getPreloadedState = <K extends keyof PreloadedRootState>(sliceNames: K[]): PreloadedRootState => {
  return sliceNames.reduce<PreloadedRootState>((preloadedState, sliceName) => {
    const sliceState = local.getItem<PreloadedRootState[K]>(sliceName)

    if (sliceState) {
      preloadedState[sliceName] = sliceState
    }

    return preloadedState
  }, {})
}

export const persistState = <K extends keyof PreloadedRootState>(sliceNames: K[]): Middleware<{}, RootState> => {
  return (store) => (next) => (action) => {
    const result = next(action)

    // No need to persist broadcasted actions because they are persisted in another tab
    if (action._isBroadcasted) return result

    const sliceType = action.type.split('/')[0]
    const name = sliceNames.find((slice) => slice === sliceType)

    if (name) {
      const state = store.getState()
      const sliceState = state[name]

      if (sliceState) {
        local.setItem(name, sliceState)
      } else {
        local.removeItem(name)
      }
    }

    return result
  }
}
