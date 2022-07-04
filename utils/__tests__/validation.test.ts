import { validateAddress, validatePrefixedAddress } from '@/utils/validation'

describe('validation', () => {
  describe('Ethereum address validation', () => {
    it('should return undefined if the address is valid', () => {
      expect(validateAddress('0x1234567890123456789012345678901234567890')).toBeUndefined()
    })

    it('should return an error if the address is invalid', () => {
      expect(validateAddress('0x1234567890123456789012345678901234567890x')).toBe('Invalid address format')
      expect(validateAddress('0x8Ba1f109551bD432803012645Ac136ddd64DBA72')).toBe('Invalid address checksum')
    })
  })

  describe('Prefixed address validation', () => {
    const validate = validatePrefixedAddress('rin')

    it('should pass a bare address', () => {
      expect(validate('0x1234567890123456789012345678901234567890')).toBe(undefined)
    })

    it('should return an error if the address has an invalid prefix', () => {
      expect(validate('xyz:0x1234567890123456789012345678901234567890')).toBe('Invalid chain prefix "xyz"')
    })

    it('should return an error if the address has the wrong prefix', () => {
      expect(validate('eth:0x1234567890123456789012345678901234567890')).toBe(`"eth" doesn't match the current chain`)
    })

    it('should pass validation is the address has the correct prefix', () => {
      expect(validate('rin:0x1234567890123456789012345678901234567890')).toBe(undefined)
    })
  })
})
