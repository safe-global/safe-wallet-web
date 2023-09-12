import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '.'

export enum CeloDisclaimerType {
  REMIND_ME = 'remind_me',
}

export type CeloDisclaimerState = Record<CeloDisclaimerType, boolean | number | undefined>

const initialState: CeloDisclaimerState = {
  [CeloDisclaimerType.REMIND_ME]: undefined,
}

export const celoDisclaimerSlice = createSlice({
  name: 'celoDisclaimer',
  initialState,
  reducers: {
    saveCeloDisclaimerChoice: (_, { payload }: PayloadAction<CeloDisclaimerState>) => ({
      [CeloDisclaimerType.REMIND_ME]: payload[CeloDisclaimerType.REMIND_ME] === true ? Date.now() : false,
    }),
  },
})

export const { saveCeloDisclaimerChoice } = celoDisclaimerSlice.actions

export const selectCeloDisclaimerChoices = (state: RootState) => state[celoDisclaimerSlice.name]
