import { _getCsvData } from '.'

describe('ExportDialog', () => {
  describe('getCsvData', () => {
    it('should format the address book correctly', () => {
      const addressBooks = {
        '4': {
          '0x0': 'John Smith',
          '0x1': 'Jane Doe',
        },
        '100': {
          '0x0': 'John Smith',
          '0x2': 'Alice Cooper',
        },
      }

      expect(_getCsvData(addressBooks)).toStrictEqual([
        { address: '0x0', name: 'John Smith', chainId: '4' },
        { address: '0x1', name: 'Jane Doe', chainId: '4' },
        { address: '0x0', name: 'John Smith', chainId: '100' },
        { address: '0x2', name: 'Alice Cooper', chainId: '100' },
      ])
    })
  })
})
