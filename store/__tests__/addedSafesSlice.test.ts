import { addSafe, removeSafe, addedSafesSlice } from '../addedSafesSlice'

describe('addedSafesSlice', () => {
  it('should add a Safe to the store', () => {
    const state = addedSafesSlice.reducer(undefined, addSafe({ chainId: '1', address: '0x0' }))
    expect(state).toEqual({ '1': ['0x0'] })

    const stateB = addedSafesSlice.reducer(state, addSafe({ chainId: '4', address: '0x1' }))
    expect(stateB).toEqual({ '1': ['0x0'], '4': ['0x1'] })

    const stateC = addedSafesSlice.reducer(stateB, addSafe({ chainId: '1', address: '0x2' }))
    expect(stateC).toEqual({ '1': ['0x0', '0x2'], '4': ['0x1'] })
  })

  it('should remove a Safe from the store', () => {
    const state = addedSafesSlice.reducer({ '1': ['0x0'], '4': ['0x0'] }, removeSafe({ chainId: '1', address: '0x0' }))
    expect(state).toEqual({ '4': ['0x0'], '1': [] })
  })
})
