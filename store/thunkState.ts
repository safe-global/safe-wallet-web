import type {
  AsyncThunkFulfilledActionCreator,
  AsyncThunkPendingActionCreator,
  AsyncThunkRejectedActionCreator,
} from '@reduxjs/toolkit/dist/createAsyncThunk'
import type { SerializedError } from '@reduxjs/toolkit'

type PendingAction = ReturnType<AsyncThunkPendingActionCreator<unknown>>
type FulfilledAction = ReturnType<AsyncThunkFulfilledActionCreator<unknown, unknown>>
type RejectedAction = ReturnType<AsyncThunkRejectedActionCreator<unknown>>

// Matches that of Redux: 'idle' | 'pending' | 'fulfilled' | 'rejected'
export type LOADING_STATUS = 'idle' | (PendingAction | FulfilledAction | RejectedAction)['meta']['requestStatus']

export type ThunkState = {
  requestStatus: LOADING_STATUS
  error?: SerializedError
}

export const initialThunkState: ThunkState = {
  requestStatus: 'idle',
  error: undefined,
}

export const getPendingState = ({ meta }: PendingAction): ThunkState => ({
  requestStatus: meta.requestStatus,
  error: undefined,
})

export const getFulfilledState = ({ meta }: FulfilledAction): ThunkState => ({
  requestStatus: meta.requestStatus,
  error: undefined,
})

export const getRejectedState = ({ meta, error }: RejectedAction): ThunkState => ({
  requestStatus: meta.requestStatus,
  error,
})
