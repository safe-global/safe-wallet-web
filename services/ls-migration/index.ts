import Storage from '@/services/localStorage/Storage'
import newStorage from '@/services/localStorage/local'
import { addressBookSlice, type AddressBookState } from '@/store/addressBookSlice'
import { addedSafesSlice, type AddedSafesState, type AddedSafesOnChain } from '@/store/addedSafesSlice'

const OLD_PREFIX = 'SAFE__'
const IMMORTAL_PREFIX = '_immortal|v2_'
const CHAIN_PREFIXES: Record<string, string> = {
  '1': 'MAINNET',
  '4': 'RINKEBY',
  '56': 'BSC',
  '100': 'XDAI',
  '137': 'POLYGON',
  '246': 'ENERGY_WEB_CHAIN',
  '42161': 'ARBITRUM',
  '73799': 'VOLTA',
}
const ALL_CHAINS = ['1', '100', '137', '56', '246', '42161', '1313161554', '43114', '10', '5', '4', '73799']

const oldStorage = new Storage(typeof window !== 'undefined' ? window.localStorage : undefined, '')

export const _migrateAddressBook = () => {
  type OldAddressBook = Array<{ address: string; name: string; chainId: string }>

  // Don't migrate if the new storage is already populated
  const currAb = newStorage.getItem<AddressBookState>(addressBookSlice.name)
  if (currAb && Object.keys(currAb).length > 0) {
    return
  }

  const legacyAb = oldStorage.getItem<OldAddressBook>(OLD_PREFIX + 'addressBook')
  if (Array.isArray(legacyAb)) {
    console.log('Migrating address book')

    const newAb = legacyAb.reduce<AddressBookState>((acc, { address, name, chainId }) => {
      acc[chainId] = acc[chainId] || {}
      acc[chainId][address] = name
      return acc
    }, {})

    newStorage.setItem<AddressBookState>(addressBookSlice.name, newAb)
  }
}

export const _migrateAddedSafes = () => {
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

  // Don't migrate if the new storage is already populated
  const prevAddedSafes = newStorage.getItem<AddedSafesState>(addedSafesSlice.name)
  if (prevAddedSafes && Object.keys(prevAddedSafes).length > 0) {
    return
  }

  const newAddedSafes: AddedSafesState = {}

  ALL_CHAINS.forEach((chainId) => {
    const chainPrefix = CHAIN_PREFIXES[chainId] || chainId
    const legacyAddedSafes = oldStorage.getItem<OldAddedSafes>(IMMORTAL_PREFIX + chainPrefix + '__SAFES')

    if (legacyAddedSafes && Object.keys(legacyAddedSafes).length > 0) {
      console.log('Migrating added safes on chain', chainId)

      newAddedSafes[chainId] = Object.values(legacyAddedSafes).reduce<AddedSafesOnChain>((acc, oldItem) => {
        acc[oldItem.address] = {
          ethBalance: oldItem.ethBalance,
          owners: oldItem.owners.map((value) => ({ value, name: null, logoUri: null })),
          threshold: oldItem.threshold,
        }
        return acc
      }, {})
    }
  })

  if (Object.keys(newAddedSafes).length > 0) {
    newStorage.setItem<AddedSafesState>(addedSafesSlice.name, newAddedSafes)
  }
}

// Migrate legacy localStorage data to the new format and keys
const migrateStorage = () => {
  _migrateAddressBook()
  _migrateAddedSafes()
}

export default migrateStorage
