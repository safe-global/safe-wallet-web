import { type SafeCollectibleResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { makeLoadableSlice, makeSliceSelector } from './common'

type CollectiblesData = SafeCollectibleResponse[]

export const collectiblesSlice = makeLoadableSlice<CollectiblesData>('collectibles', [])
export const selectCollectibles = makeSliceSelector<CollectiblesData>(collectiblesSlice)
