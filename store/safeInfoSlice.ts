import { type SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { makeLoadableSlice } from './common'

const { slice, selector } = makeLoadableSlice('safeInfo', undefined as SafeInfo | undefined)

export const safeInfoSlice = slice
export const selectSafeInfo = selector
