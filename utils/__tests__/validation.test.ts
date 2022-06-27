import * as validators from '@/utils/validation'

describe('validation', () => {
  describe('Ethereum address validation', () => {
    it('should return undefined if the address is valid', () => {
      expect(validators.validateAddress('0x1234567890123456789012345678901234567890')).toBeUndefined()
    })

    it('should return an error if the address is invalid', () => {
      expect(validators.validateAddress('0x1234567890123456789012345678901234567890x')).toBe('Invalid address format')
      expect(validators.validateAddress('0x8Ba1f109551bD432803012645Ac136ddd64DBA72')).toBe('Invalid address checksum')
    })
  })
})
