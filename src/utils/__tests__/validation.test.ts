import {
  validateAddress,
  validateAmount,
  validateChainId,
  validateNumber,
  validatePrefixedAddress,
} from '@/utils/validation'

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

  describe('Ethereum chain ID validation', () => {
    it('should return undefined if the chain ID is valid', () => {
      expect(validateChainId('1')).toBeUndefined()
    })
    it('should return an error if the chain ID is invalid', () => {
      expect(validateChainId('0')).toBe('Invalid chain ID')
      expect(validateChainId('34534534532634565345646456546')).toBe('Invalid chain ID')
      expect(validateChainId('0x8Ba1f109551bD432803012645Ac136ddd64DBA72')).toBe('Invalid chain ID')
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

  describe('Number validation', () => {
    it('returns an error if its not a number', () => {
      const result = validateNumber('abc')

      expect(result).toBe('The amount must be a number')
    })

    it('returns an error if its a number smaller than or equal 0', () => {
      const result1 = validateNumber('0')
      expect(result1).toBe('The amount must be greater than 0')

      const result2 = validateNumber('-1')
      expect(result2).toBe('The amount must be greater than 0')
    })
  })

  describe('Token amount validation', () => {
    it('returns an error if its not a number', () => {
      const result = validateAmount('abc', 18, '100')

      expect(result).toBe('The amount must be a number')
    })

    it('returns an error if its a number smaller than or equal 0', () => {
      const result1 = validateAmount('0', 18, '100')
      expect(result1).toBe('The amount must be greater than 0')

      const result2 = validateAmount('-1', 18, '100')
      expect(result2).toBe('The amount must be greater than 0')
    })

    it('returns an error if its larger than the max', () => {
      const result = validateAmount('101', 18, '100000000000000000000')
      expect(result).toBe('Maximum value is 100')
    })
  })
})
