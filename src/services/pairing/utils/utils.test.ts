import { formatPairingUri, isPairingSupported } from '../utils'

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

  describe('isPairingSupported', () => {
    it('should return true if the wallet is enabled', () => {
      const result = isPairingSupported(['walletConnect'])
      expect(result).toBe(true)
    })

    it('should return false if the wallet is disabled', () => {
      const result1 = isPairingSupported([])
      expect(result1).toBe(false)

      const result2 = isPairingSupported(['safeMobile'])
      expect(result2).toBe(false)
    })
  })
})
