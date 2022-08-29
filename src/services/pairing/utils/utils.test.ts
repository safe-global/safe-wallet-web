import { formatPairingUri } from '../utils'

describe('Pairing utils', () => {
  describe('formatPairingUri', () => {
    it('should return a prefixed URI', () => {
      const uri = 'wc:1-2@1?bridge=https://test.com/&key=1234'

      const result = formatPairingUri(uri)
      expect(result).toBe('safe-wc:1-2@1?bridge=https://test.com/&key=1234')
    })

    it('should return undefined if no URI exists', () => {
      const result = formatPairingUri('')
      expect(result).toBeUndefined()
    })

    it("should return undefined if the URI doesn't end with a key", () => {
      const uri = 'wc:1-2@1?bridge=https://test.com/&key='

      const result = formatPairingUri(uri)
      expect(result).toBeUndefined()
    })
  })
})
