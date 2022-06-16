import { SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { addOrUpdateSafe, removeSafe, addedSafesSlice } from '../addedSafesSlice'

describe('addedSafesSlice', () => {
  it('should add a Safe to the store', () => {
    const safe0 = { chainId: '1', address: { value: '0x0' } } as SafeInfo
    const state = addedSafesSlice.reducer(undefined, addOrUpdateSafe({ safe: safe0 }))
    expect(state).toEqual({ '1': { ['0x0']: safe0 } })

    const safe1 = { chainId: '4', address: { value: '0x1' } } as SafeInfo
    const stateB = addedSafesSlice.reducer(state, addOrUpdateSafe({ safe: safe1 }))
    expect(stateB).toEqual({ '1': { ['0x0']: safe0 }, '4': { ['0x1']: safe1 } })

    const safe2 = { chainId: '1', address: { value: '0x2' } } as SafeInfo
    const stateC = addedSafesSlice.reducer(stateB, addOrUpdateSafe({ safe: safe2 }))
    expect(stateC).toEqual({
      '1': {
        ['0x0']: safe0,
        ['0x2']: safe2,
      },
      '4': { ['0x1']: safe1 },
    })
  })

  it('should remove a Safe from the store', () => {
    const state = addedSafesSlice.reducer(
      { '1': { ['0x0']: {} as SafeInfo, ['0x1']: {} as SafeInfo }, '4': { ['0x0']: {} as SafeInfo } },
      removeSafe({ chainId: '1', address: '0x1' }),
    )
    expect(state).toEqual({ '1': { ['0x0']: {} as SafeInfo }, '4': { ['0x0']: {} as SafeInfo } })
  })

  it('should remove the chain from the store', () => {
    const state = addedSafesSlice.reducer(
      { '1': { ['0x0']: {} as SafeInfo }, '4': { ['0x0']: {} as SafeInfo } },
      removeSafe({ chainId: '1', address: '0x0' }),
    )
    expect(state).toEqual({ '4': { ['0x0']: {} as SafeInfo } })
  })
})
