import { type SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { makeLoadableSlice, makeSliceSelector } from './common'

export const safeInfoSlice = makeLoadableSlice<SafeInfo>('safeInfo')
export const selectSafeInfo = makeSliceSelector<SafeInfo>(safeInfoSlice)
