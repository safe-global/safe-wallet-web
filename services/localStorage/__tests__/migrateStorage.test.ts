import migrateStorage from '../migrateStorage'

const oldStorage = {
  SAFE__addressBook: [
    { address: '0x123', name: 'Alice', chainId: '1' },
    { address: '0x456', name: 'Bob', chainId: '1' },
    { address: '0x789', name: 'Charlie', chainId: '4' },
    { address: '0xabc', name: 'Dave', chainId: '4' },
  ],
  'SAFE__currencyValues.selectedCurrency': 'USD',
}

describe('migrateStorage', () => {
  beforeEach(() => {
    Object.entries(oldStorage).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value))
    })
  })

  it('should migrate the address book', () => {
    migrateStorage()

    expect(localStorage.getItem('SAFE__addressBook')).toBe(null)
    expect(localStorage.getItem('SAFE_v2__addressBook')).toBe(
      JSON.stringify({
        '1': {
          '0x123': 'Alice',
          '0x456': 'Bob',
        },
        '4': {
          '0x789': 'Charlie',
          '0xabc': 'Dave',
        },
      }),
    )
  })

  it('should migrate the currency preference', () => {
    migrateStorage()

    expect(localStorage.getItem('SAFE__currencyValues.selectedCurrency')).toBe(null)
    expect(localStorage.getItem('SAFE_v2__currency')).toBe('"USD"')
  })
})
