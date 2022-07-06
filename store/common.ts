import { createSlice, type Draft, type PayloadAction, type Slice } from '@reduxjs/toolkit'
import { RootState } from '.'

export type Loadable<T> = {
  data: T | undefined
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
      set: (_, { payload }: PayloadAction<Loadable<Draft<T> | undefined>>) => payload,
    },
  })
}

export const makeSliceSelector = <T>(slice: Slice) => {
  return (state: RootState): Loadable<T> => state[slice.name]
}
