import type {
  AsyncThunkFulfilledActionCreator,
  AsyncThunkPendingActionCreator,
  AsyncThunkRejectedActionCreator,
} from '@reduxjs/toolkit/dist/createAsyncThunk'
import type { WritableDraft } from 'immer/dist/internal'
import type { SerializedError } from '@reduxjs/toolkit'

type PendingAction = ReturnType<AsyncThunkPendingActionCreator<unknown>>
type FulfilledAction = ReturnType<AsyncThunkFulfilledActionCreator<unknown, unknown>>
type RejectedAction = ReturnType<AsyncThunkRejectedActionCreator<unknown>>

// Matches that of Redux: 'idle' | 'pending' | 'fulfilled' | 'rejected'
export type LOADING_STATUS = 'idle' | (PendingAction | FulfilledAction | RejectedAction)['meta']['requestStatus']

export type ThunkState = {
  requestStatus: LOADING_STATUS
  error?: SerializedError
  requestId?: string
}

export const initialThunkState: ThunkState = {
  requestStatus: 'idle',
  error: undefined,
  requestId: undefined,
}

export const isRaceCondition = <T extends Record<string, unknown>>(
  state: WritableDraft<T>,
  { meta }: PendingAction | FulfilledAction | RejectedAction,
) => {
  const isInitialDispatch = state.requestStatus === 'idle'
  if (isInitialDispatch) {
    return false
  }
  return state.requestId ? state.requestId !== meta.requestId : false
}

export const getPendingState = ({ meta }: PendingAction): ThunkState => ({
  requestId: meta.requestId,
  requestStatus: meta.requestStatus,
  error: undefined,
})

export const getFulfilledState = ({ meta }: FulfilledAction): ThunkState => ({
  requestId: undefined,
  requestStatus: meta.requestStatus,
  error: undefined,
})

export const getRejectedState = ({ meta, error }: RejectedAction): ThunkState => ({
  requestId: undefined,
  requestStatus: meta.requestStatus,
  error,
})
