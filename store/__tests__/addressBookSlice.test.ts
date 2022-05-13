import { addressBookSlice, setAddressBook, upsertAddressBookEntry, removeAddressBookEntry } from '../addressBookSlice'

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
})
