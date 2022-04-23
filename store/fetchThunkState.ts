import type { SerializedError } from '@reduxjs/toolkit'

export const enum LOADING_STATUS {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

export type FetchState = {
  status: LOADING_STATUS
  error?: SerializedError
}

export const initialFetchState: FetchState = {
  status: LOADING_STATUS.IDLE,
  error: undefined,
}
