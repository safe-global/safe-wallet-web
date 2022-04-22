import * as validators from '../validation'

describe('validation', () => {
  describe('Ethereum address validation', () => {
    it('should return undefined if the address is valid', () => {
      expect(validators.validateAddress('0x1234567890123456789012345678901234567890')).toBeUndefined()
    })

    it('should return an error if the address is invalid', () => {
      expect(validators.validateAddress('0x1234567890123456789012345678901234567890x')).toBe('Invalid address format')
      expect(validators.validateAddress('0x1234a67890123456789012345678901234567890')).toBe('Invalid address checksum')
    })
  })
})
