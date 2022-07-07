import { type SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { makeLoadableSlice } from './common'

const initialState: SafeCollectibleResponse[] = []

const { slice, selector } = makeLoadableSlice('collectibles', initialState)

export const collectiblesSlice = slice
export const selectCollectibles = selector
