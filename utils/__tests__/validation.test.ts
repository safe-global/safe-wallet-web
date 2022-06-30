import * as validators from '@/utils/validation'

describe('validation', () => {
  describe('Ethereum address validation', () => {
    const validateAddress = validators.validateAddress('rin')

    it('should return undefined if the address is valid', () => {
      expect(validateAddress('0x1234567890123456789012345678901234567890')).toBeUndefined()
    })

    it('should return an error if the address is invalid', () => {
      expect(validateAddress('0x1234567890123456789012345678901234567890x')).toBe('Invalid address format')
      expect(validateAddress('0x8Ba1f109551bD432803012645Ac136ddd64DBA72')).toBe('Invalid address checksum')
    })

    it('should return an error if the address has an invalid prefix', () => {
      expect(validateAddress('xyz:0x1234567890123456789012345678901234567890')).toBe('Invalid chain prefix "xyz"')
    })

    it('should return an error if the address has the wrong prefix', () => {
      expect(validateAddress('eth:0x1234567890123456789012345678901234567890')).toBe(
        `"eth" doesn't match the current chain`,
      )
    })

    it('should pass validation is the address has the correct prefix', () => {
      expect(validateAddress('rin:0x1234567890123456789012345678901234567890')).toBe(undefined)
    })
  })
})
