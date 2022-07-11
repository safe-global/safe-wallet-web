import { _migrateAddressBook, _migrateAddedSafes } from '.'

describe('migrateStorage', () => {
  describe('_migrateAddressBook', () => {
    const oldStorage = {
      SAFE__addressBook: [
        { address: '0x123', name: 'Alice', chainId: '1' },
        { address: '0x456', name: 'Bob', chainId: '1' },
        { address: '0x789', name: 'Charlie', chainId: '4' },
        { address: '0xabc', name: 'Dave', chainId: '4' },
      ],
    }

    beforeEach(() => {
      Object.entries(oldStorage).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value))
      })
    })

    it('should migrate the address book', () => {
      _migrateAddressBook()

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
  })

  describe('_migrateAddedSafes', () => {
    const oldStorage = {
      '_immortal|v2_MAINNET__SAFES': {
        '0x123': { address: '0x123', chainId: '1', ethBalance: '0.1', owners: ['0x123'], threshold: 1 },
        '0x456': { address: '0x456', chainId: '1', ethBalance: '20.3', owners: ['0x456', '0x789'], threshold: 2 },
      },
      '_immortal|v2_1313161554__SAFES': {
        '0x789': { address: '0x789', chainId: '1313161554', ethBalance: '0', owners: ['0x789'], threshold: 1 },
        '0xabc': {
          address: '0xabc',
          chainId: '1313161554',
          ethBalance: '0.00001',
          owners: ['0xabc', '0xdef', '0x123'],
          threshold: 2,
        },
      },
    }

    beforeEach(() => {
      Object.entries(oldStorage).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value))
      })
    })

    it('should migrate the added safes', () => {
      _migrateAddedSafes()

      const result = localStorage.getItem('SAFE_v2__addedSafes')

      expect(result).not.toBe('')
      expect(JSON.parse(result || '')).toEqual({
        '1': {
          '0x123': {
            ethBalance: '0.1',
            owners: [{ value: '0x123', name: null, logoUri: null }],
            threshold: 1,
          },
          '0x456': {
            ethBalance: '20.3',
            owners: [
              { value: '0x456', name: null, logoUri: null },
              { value: '0x789', name: null, logoUri: null },
            ],
            threshold: 2,
          },
        },
        '1313161554': {
          '0x789': {
            ethBalance: '0',
            owners: [{ value: '0x789', name: null, logoUri: null }],
            threshold: 1,
          },
          '0xabc': {
            ethBalance: '0.00001',
            owners: [
              { value: '0xabc', name: null, logoUri: null },
              { value: '0xdef', name: null, logoUri: null },
              { value: '0x123', name: null, logoUri: null },
            ],
            threshold: 2,
          },
        },
      })
    })
  })
})
