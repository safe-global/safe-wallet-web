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
  const isInitialFetch = state.requestStatus === 'idle'
  return isInitialFetch ? false : state.requestId !== meta.requestId
}

export const getPendingState = <T extends Record<string, unknown>>(state: WritableDraft<T>, action: PendingAction) => {
  const { requestStatus, requestId } = action.meta
  return {
    ...state,
    requestStatus,
    requestId,
    error: undefined,
  }
}

export const getFulfilledState = <T extends Record<string, unknown>>(
  state: WritableDraft<T>,
  action: FulfilledAction,
) => {
  return {
    ...state,
    requestStatus: action.meta.requestStatus,
    requestId: undefined,
    error: undefined,
  }
}
export const getRejectedState = <T extends Record<string, unknown>>(
  state: WritableDraft<T>,
  { meta, error }: RejectedAction,
) => {
  return {
    ...state,
    requestStatus: meta.requestStatus,
    requestId: undefined,
    error,
  }
}
