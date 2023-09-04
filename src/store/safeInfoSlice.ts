import { type SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { makeLoadableSlice } from './common'

export const defaultSafeInfo: SafeInfo = {
  address: { value: '' },
  chainId: '',
  nonce: -1,
  threshold: 0,
  owners: [],
  implementation: { value: '' },
  implementationVersionState: '' as SafeInfo['implementationVersionState'],
  modules: null,
  guard: null,
  fallbackHandler: { value: '' },
  version: '',
  collectiblesTag: '',
  txQueuedTag: '',
  txHistoryTag: '',
  messagesTag: '',
}

const { slice, selector } = makeLoadableSlice('safeInfo', undefined as SafeInfo | undefined)

export const safeInfoSlice = slice
export const selectSafeInfo = selector
