import { ImplementationVersionState, type SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { makeLoadableSlice } from './common'

const emptyAddress = { value: '' }

export const defaultSafeInfo: SafeInfo = {
  address: emptyAddress,
  chainId: '',
  nonce: -1,
  threshold: 0,
  owners: [],
  implementation: emptyAddress,
  implementationVersionState: ImplementationVersionState.UP_TO_DATE,
  modules: null,
  guard: null,
  fallbackHandler: emptyAddress,
  version: '',
  collectiblesTag: '',
  txQueuedTag: '',
  txHistoryTag: '',
}

const { slice, selector } = makeLoadableSlice('safeInfo', undefined as SafeInfo | undefined)

export const safeInfoSlice = slice
export const selectSafeInfo = selector
