import { _getCsvData } from '.'

describe('ExportDialog', () => {
  describe('getCsvData', () => {
    it('should format the address book correctly', () => {
      const addressBook = {
        '0x0': 'John Smith',
        '0x1': 'Jane Doe',
      }

      expect(_getCsvData(addressBook, '4')).toStrictEqual([
        { address: '0x0', name: 'John Smith', chainId: '4' },
        { address: '0x1', name: 'Jane Doe', chainId: '4' },
      ])
    })
  })
})
