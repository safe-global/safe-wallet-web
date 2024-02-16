import type { Store } from 'redux'
import type { Middleware, PreloadedState } from '@reduxjs/toolkit'
import type { RootState } from '@/store'

type PreloadedRootState = PreloadedState<RootState>

const BC_NAME = 'SAFE__store-updates'
const tabId = Math.random().toString(32).slice(2)
let broadcast: BroadcastChannel | undefined

export const broadcastState = <K extends keyof PreloadedRootState>(sliceNames: K[]): Middleware<{}, RootState> => {
  return (_) => (next) => (action) => {
    const result = next(action)

    // Broadcast actions that aren't being already broadcasted
    if (!action._isBroadcasted) {
      const sliceType = action.type.split('/')[0]
      if (sliceNames.includes(sliceType)) {
        broadcast?.postMessage({ action, tabId })
      }
    }

    return result
  }
}

export const listenToBroadcast = (store: Store<RootState>) => {
  broadcast = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(BC_NAME) : undefined

  broadcast?.addEventListener('message', ({ data }) => {
    if (data.tabId !== tabId) {
      store.dispatch({ ...data.action, _isBroadcasted: true })
    }
  })
}
