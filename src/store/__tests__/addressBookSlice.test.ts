import {
  addressBookSlice,
  setAddressBook,
  upsertAddressBookEntry,
  removeAddressBookEntry,
  selectAddressBookByChain,
} from '../addressBookSlice'

const initialState = {
  '1': { '0x0': 'Alice', '0x1': 'Bob' },
  '4': { '0x0': 'Charlie', '0x1': 'Dave' },
}

describe('addressBookSlice', () => {
  it('should set the address book', () => {
    const state = addressBookSlice.reducer(undefined, setAddressBook(initialState))
    expect(state).toEqual(initialState)
  })

  it('should insert an entry in the address book', () => {
    const state = addressBookSlice.reducer(
      initialState,
      upsertAddressBookEntry({
        chainId: '1',
        address: '0x2',
        name: 'Fred',
      }),
    )
    expect(state).toEqual({
      '1': { '0x0': 'Alice', '0x1': 'Bob', '0x2': 'Fred' },
      '4': { '0x0': 'Charlie', '0x1': 'Dave' },
    })
  })

  it('should ignore empty names in the address book', () => {
    const state = addressBookSlice.reducer(
      initialState,
      upsertAddressBookEntry({
        chainId: '1',
        address: '0x2',
        name: '',
      }),
    )
    expect(state).toEqual(initialState)
  })

  it('should edit an entry in the address book', () => {
    const state = addressBookSlice.reducer(
      initialState,
      upsertAddressBookEntry({
        chainId: '1',
        address: '0x0',
        name: 'Alice in Wonderland',
      }),
    )
    expect(state).toEqual({
      '1': { '0x0': 'Alice in Wonderland', '0x1': 'Bob' },
      '4': { '0x0': 'Charlie', '0x1': 'Dave' },
    })
  })

  it('should remove an entry from the address book', () => {
    const stateB = addressBookSlice.reducer(
      initialState,
      removeAddressBookEntry({
        chainId: '1',
        address: '0x0',
      }),
    )
    expect(stateB).toEqual({
      '1': { '0x1': 'Bob' },
      '4': { '0x0': 'Charlie', '0x1': 'Dave' },
    })
  })

  it('should remove the chain if the last entry is removed', () => {
    const state = addressBookSlice.reducer(
      {
        '1': { '0x0': 'Alice' },
      },
      removeAddressBookEntry({
        chainId: '1',
        address: '0x0',
      }),
    )
    expect(state).toStrictEqual({})
  })

  it('should not return entries with invalid address format', () => {
    const initialState = {
      '1': { '0x0': 'Alice', '0x1': 'Bob', '0x2': 'Fred' },
      '5': {
        '0x744aaf04ad770895ce469300771d2ca38463cfa0': 'unchecksummed',
        '0x744aAF04AD770895Ce469300771D2CA38463cFa0': 'checksummed',
        undefined: 'bug',
      },
    }

    const expectedOutput = {
      '0x744aAF04AD770895Ce469300771D2CA38463cFa0': 'checksummed',
    }

    expect(selectAddressBookByChain.resultFunc(initialState, '5')).toEqual(expectedOutput)
  })
})
