import { type SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { makeLoadableSlice } from './common'

const emptyAddress = { value: '' }

export const defaultSafeInfo: SafeInfo = {
  address: emptyAddress,
  chainId: '',
  nonce: -1,
  threshold: -1,
  owners: [],
  implementation: emptyAddress,
  modules: null,
  guard: null,
  fallbackHandler: emptyAddress,
  version: '',
  collectiblesTag: '',
  txQueuedTag: '',
  txHistoryTag: '',
}

const { slice, selector } = makeLoadableSlice('safeInfo', defaultSafeInfo)

export const safeInfoSlice = slice
export const selectSafeInfo = selector
