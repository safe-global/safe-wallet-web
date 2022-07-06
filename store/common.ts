import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '.'

export type Loadable<T> = {
  data: T
  loading: boolean
  error?: Error
}

export const makeLoadableSlice = <T>(name: string, data?: T) => {
  return createSlice({
    name,
    initialState: {
      data,
      loading: false,
    },
    reducers: {
      set: (_, { payload }: PayloadAction<Loadable<T | undefined>>) => ({
        ...payload,
        data: payload.data ?? data, // fallback to initialState.data
      }),
    },
  })
}

export const makeSliceSelector = <T>(slice: ReturnType<typeof makeLoadableSlice<T>>) => {
  return (state: RootState): Loadable<T> => state[slice.name]
}
