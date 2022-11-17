import { type AddedSafesState, type AddedSafesOnChain } from '@/store/addedSafesSlice'
import type { LOCAL_STORAGE_DATA } from './common'
import { parseLsValue } from './common'

const IMMORTAL_PREFIX = '_immortal|v2_'

const CHAIN_PREFIXES: Record<string, string> = {
  '1': 'MAINNET',
  '56': 'BSC',
  '100': 'XDAI',
  '137': 'POLYGON',
  '246': 'ENERGY_WEB_CHAIN',
  '42161': 'ARBITRUM',
  '73799': 'VOLTA',
}
const ALL_CHAINS = ['1', '100', '137', '56', '246', '42161', '1313161554', '43114', '10', '5', '73799']

const OLD_LS_KEY = '__SAFES'

type OldAddedSafes = Record<
  string,
  {
    address: string
    chainId: string
    ethBalance: string
    owners: string[]
    threshold: number
  }
>

export const migrateAddedSafes = (lsData: LOCAL_STORAGE_DATA): AddedSafesState | void => {
  const newAddedSafes: AddedSafesState = {}

  ALL_CHAINS.forEach((chainId) => {
    const chainPrefix = CHAIN_PREFIXES[chainId] || chainId
    const legacyAddedSafes = parseLsValue<OldAddedSafes>(lsData[IMMORTAL_PREFIX + chainPrefix + OLD_LS_KEY])

    if (legacyAddedSafes && Object.keys(legacyAddedSafes).length > 0) {
      console.log('Migrating added safes on chain', chainId)

      const safesPerChain = Object.values(legacyAddedSafes).reduce<AddedSafesOnChain>((acc, oldItem) => {
        acc[oldItem.address] = {
          ethBalance: oldItem.ethBalance,
          owners: oldItem.owners.map((value) => ({ value })),
          threshold: oldItem.threshold,
        }
        return acc
      }, {})

      if (Object.keys(safesPerChain).length > 0) {
        newAddedSafes[chainId] = safesPerChain
      }
    }
  })

  if (Object.keys(newAddedSafes).length > 0) {
    return newAddedSafes
  }
}
