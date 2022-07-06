import { type SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { makeLoadableSlice } from './common'

const { slice, selector } = makeLoadableSlice('collectibles', [] as SafeCollectibleResponse[])

export const collectiblesSlice = slice
export const selectCollectibles = selector
